/**
 * Cart methods
 * -----------------------------------------------------------------------------
 *
 * @namespace cart
 */

import axios from 'axios';
// date picker component
import flatPickr from 'vue-flatpickr-component';
import 'flatpickr/dist/flatpickr.css';

const cartMethods = {
  components: {
    flatPickr,
  },

  data() {
    return {
      isCartAjaxed: false,
      isCartPage: false,
      loadingEvent: null,
      cart: window.theme.cart,

      // shipping calculator
      countries: window.Countries,
      provinces: null,
      selectedCountry: null,
      selectedProvince: null,
      selectedZip: null,
      zipRequired: false,
      shippingRates: null,
      shippingRatesErrors: null,
      hasAutoRenew: false,
      subscriptionOrder: [],
      ontimeOrder: [],
      // date picker
      // get more from https://chmln.github.io/flatpickr/options/
      datePickerConfig: {
        wrap: true, // set wrap to true only when using 'input-group'
        altFormat: 'M j, Y',
        altInput: true,
        dateFormat: 'Y-m-d',
        enableTime: false,
        locale: {
          firstDayOfWeek: 1, // start week on Monday
        },
        // minDate: "today",
        minDate: new Date().fp_incr(0), // 2 days from now

        // disable Saturdays and Sundays - disable using a function
        disable: [
          function(date) {
            // must return true to disable
            // return (date.getDay() === 6 || date.getDay() === 0);
          },
        ],
      },
      hearAboutUs: {
        value: '',
        value2: '',
        openSelect: false,
        errorSelect: false,
        errorInput: false,
        valid: false,
      },
    };
  },

  watch: {
    selectedCountry() {
      const selectedCountryObj = app.countries[app.selectedCountry];
      const selectedProvincesObj = selectedCountryObj.province_alternate_names;
      const provincesLength = Object.keys(selectedProvincesObj).length;

      // clear data
      app.shippingRates = null;
      app.shippingRatesErrors = null;
      app.selectedZip = null;

      // set data
      app.zipRequired = selectedCountryObj.zip_required;

      if (provincesLength > 0) {
        app.provinces = selectedProvincesObj;
        // app.selectedProvince = Object.keys(app.provinces)[0]
      } else {
        app.provinces = null;
      }
    },
  },


  methods: {
    _initCart() {
      const isCartAjaxed = $('[data-template="cart"]').data('cart-ajaxed');

      if (isCartAjaxed) {
        app.isCartAjaxed = true;
      }

      if ($('body').hasClass('template-cart')) {
        app.isCartPage = true;
      }

      if (app.cart.item_count !== 0) {
        app._initCartProp('on page load');
      }

      // shipping calculator
      app._initShippingCalculator();

    },

    //   for differentiate orders
    _initCartProp(eventType) {
      app.hasSubscription = false;
      app.hasAddon = false;
      app.subscriptionOrder = [];
      app.ontimeOrder = [];
      const additionCartJson = $.parseJSON($('[data-additional-cart-json]').html());
      if (eventType === 'on page load') {
        app.cart.items.forEach((item, i) => {
          item.line_index = i + parseInt(1);
          if (item.properties.subscription_id !== undefined || item.properties.gift_subscription_id !== undefined) {
            app.subscriptionOrder.push(item);
          } else if (item.properties.subscription_id === undefined || item.properties.gift_subscription_id === undefined) {
            app.ontimeOrder.push(item);
          }

          additionCartJson.items.forEach((line) => {
            if (item.key === line.key) {
              item.box_note = line.box_note;
            }
          });
        });
      } else {
        app.cart.items.forEach((item, i) => {
          item.line_index = i + parseInt(1);
          if (item.properties.subscription_id !== undefined || item.properties.gift_subscription_id !== undefined) {
            app.subscriptionOrder.push(item);
          } else if (item.properties.subscription_id === undefined || item.properties.gift_subscription_id === undefined) {
            app.ontimeOrder.push(item);
          }

          additionCartJson.items.forEach((line) => {
            if (item.key === line.key) {
              item.box_note = line.box_note;
            }
          });

        });
      }

      app.cart.items.forEach((item) => {
        if (item.properties.type !== undefined && item.properties.type === 'gift-recharge-autorenew') {
          app.hasSubscription = true;
          app.hasGiftSubscription = true;
          return false;
        } else if (item.properties.subscription_id !== undefined) {
          app.hasSubscription = true;
          app.hasGiftSubscription = false;
          return false;
        } else if (item.properties.gift_subscription_id !== undefined) {
          app.hasSubscription = true;
          app.hasGiftSubscription = true;
          return false;
        }
      });

      app.hasAutoRenew = false;
      app.cart.items.forEach((item) => {
        if (item.properties.type === 'gift-recharge-autorenew') {
          app.hasAutoRenew = true;
          return false;
        }
      });
      app.cart.items.forEach((item) => {
        if (item.properties.subscription_id === undefined && item.properties.gift_subscription_id === undefined) {
          app.hasAddon = true;
          return false;
        }
      });
    },

    /**
     * Get the cart data json object
     */
    _getCartData() {
      // IE11 bug: we need to disable cache for this request
      const config = {
        headers: {
          'Cache-Control': 'must-revalidate',
          'Cache-Control': 'no-cache',
          'Cache-Control': 'no-store',
          Pragma: 'no-cache',
        },
      };

      axios.get('/cart.js', config)
        .then((response) => {
          app.cart = response.data;
          app._initCartProp('from getcart');
          // app._initCartUpsells();
          // app._initCartPromos();
          return response.data;
        })
        .catch((error) => {
          // console.log(error)
          throw error;
        });
    },

    /**
     * Event to add a variant to the cart
     * adds item properties from hidden fields automatically
     *
     * @param  {number} variantId - current variant id
     */
    _addToCart(variantId, event) {
      const $form = $(event.currentTarget).closest(app.selectors.productForm);
      const $qtyEl = $form.find(app.selectors.qtyInput);
      const qtyValue = $qtyEl.val() || 1;
      const productCartLimit = $(event.currentTarget).attr('data-cart-limit') || null;
      const cartProduct = app.cart.items.find((x) => x.variant_id === variantId);
      const totalQty = (cartProduct ? Number(qtyValue) + Number(cartProduct.quantity) : qtyValue);
      const properties = {};
      // const productOptions = [];
      const productAddons = app.storeUtilities.productAddons.products;
      let eventType;
      Shopify.queue = [];

      if ($(event.currentTarget).closest('[data-card-product]').length > 0) {
        eventType = 'card-product';
      }

      // add cart limit property
      properties.cart_limit = productCartLimit;

      // check if item has product limit assigned
      if (app._productHasCartLimit(totalQty, productCartLimit)) {
        return;
      }

      if (app.currentTemplate === 'product' && $(event.currentTarget).closest('[data-product-section]').length > 0) {
        app.cartLoading = true;
        app.cartEvent = 'cartAdding';
      } else {
        app.isLoading = true;
        app.loadingEvent = 'cartAdding';
      }

      $.each($('input[name*="properties"]').serializeArray(), function() {
        const name = this.name.replace('properties[', '').replace(']', '');
        properties[name] = this.value;
      });

      // ReCharge Integration
      // if product is a subscription one use the reCharge Discount VariantId
      if ('subscription_id' in properties) {
        properties.shipping_interval_frequency = $('[name="properties[shipping_interval_frequency]"]').val();
        variantId = app.reChargeDiscountVariantId;
      }

      // push the default variantId to the Shopify queue
      Shopify.queue.push({
        variantId,
      });

      // if there are selected product add-ons
      // push them also to the Shopify queue
      if (productAddons.length > 0) {
        productAddons.forEach((product) => {
          if (product.selected) {
            Shopify.queue.push({
              variantId: product.variants[0].id,
            });
          }
        });
      }

      Shopify.moveAlong = function() {
        // If we still have requests in the queue, let's process the next one.
        if (Shopify.queue.length) {
          const request = Shopify.queue.shift();

          axios.post('/cart/add.js', {
            quantity: qtyValue,
            id: request.variantId,
            properties,
          })
            .then((response) => {
              // app._getCartRecentItem(response.data);
              Shopify.moveAlong();
              return response;
            })
            .catch((error) => {
              // console.log(error)
              if (Shopify.queue.length) {
                Shopify.moveAlong();
              }
              throw error;
            });
        } else {
          app._getCartData();
          app._vibrateDevice();
          $qtyEl.val(1); // reset qty input to 1
          app.$snotify.clear();
          $('[data-template="quickshop"]').modal('hide');

          setTimeout(() => {
            if (app.currentTemplate === 'product' && $(event.currentTarget).closest('[data-product-section]').length > 0) {
              app.cartLoading = false;
              app.cartEvent = null;
            } else {
              app.isLoading = false;
              app.loadingEvent = null;
            }

            if (eventType === 'card-product') {
              app._snotifyMsg('Success', 'Item has been added in cart.', 'Success');

            } else if (app.storeUtilities.cartUpsells.settings.showOnPopUp) {
              // app._openModalCartUpsell();
            } else {
              app._toggleCartDrawer();
            }

          }, 500);
        }
      };

      if (app.hasAutoRenew) {
        axios.post('/cart/clear.js')
          .then((response) => {
            Shopify.moveAlong();
            return response;
          })
          .catch((error) => {
            // console.log(error)
            throw error;
          });
      } else {
        Shopify.moveAlong();
      }
    },

    // add subscription in checkout
    async _addToCartSubscription(eventType) {

      if (eventType === 'subscription') {
        app.isLoading = true;
        app.loadingEvent = `cartAdding ${eventType}`;
      }

      const properties = {};
      Shopify.queue = [];

      // add cart limit property
      properties.cart_limit = null;
      // app.subscriptionFlow.giftType = eventType;

      const variantOBJ = app.subscriptionFlow.subscriptionPayment;

      if (app.subscriptionFlow.isGiftSub === 'true') {
        if (app.subscriptionFlow.giftType === 'gift-recharge-immediately') {
          properties.first_name = $.trim(app.giftEmail.first_name);
          properties.last_name = $.trim(app.giftEmail.last_name);
          properties.company = app.giftEmail.company;
          properties.email = $.trim(app.giftEmail.email);
          properties.address1 = $.trim(app.giftEmail.address1);
          properties.address2 = $.trim(app.giftEmail.address2);
          properties.city = app.giftEmail.city;
          properties.province = app.giftEmail.province;
          properties.zip = app.giftEmail.zip;
          properties.country = app.giftEmail.country;
          properties.phone = app.giftEmail.phone;
          properties.gift_note = app.giftEmail.msg;
          if (app.subscriptionFlow.giftRenew) {
            app.hasAutoRenew = true;
            properties.type = 'gift-recharge-autorenew';
            properties.is_renew = app.subscriptionFlow.giftRenew;
            properties.subscription_id = variantOBJ.metafields.subscription_id;
            properties.shipping_interval_unit_type = variantOBJ.metafields.shipping_interval_unit_type;
            properties.charge_interval_frequency = variantOBJ.metafields.charge_internal_frequency;
            properties.shipping_interval_frequency = variantOBJ.metafields.shipping_interval_frequency;
          } else {
            properties.type = app.subscriptionFlow.giftType;
            properties.gift_subscription_id = variantOBJ.metafields.subscription_id;
            properties.gift_shipping_interval_unit_type = variantOBJ.metafields.shipping_interval_unit_type;
            properties.gift_charge_interval_frequency = variantOBJ.metafields.charge_internal_frequency;
            properties.gift_shipping_interval_frequency = variantOBJ.metafields.shipping_interval_frequency;
          }
        } else if (app.subscriptionFlow.giftType === 'gift-recharge-email') {
          properties.type = app.subscriptionFlow.giftType;
          properties.date = app.giftEmail.date;
          properties.first_name = $.trim(app.giftEmail.first_name);
          properties.last_name = $.trim(app.giftEmail.last_name);
          properties.email = $.trim(app.giftEmail.email);
          properties.gift_subscription_id = variantOBJ.metafields.subscription_id;
          properties.gift_shipping_interval_frequency = variantOBJ.metafields.shipping_interval_frequency;
          properties.gift_shipping_interval_unit_type = variantOBJ.metafields.shipping_interval_unit_type;
          properties.gift_charge_interval_frequency = variantOBJ.metafields.charge_internal_frequency;
          properties.gift_note = $.trim(app.giftEmail.msg);
        }
      } else {
        // subscription property
        properties.shipping_interval_frequency = variantOBJ.metafields.shipping_interval_frequency;
        properties.shipping_interval_unit_type = variantOBJ.metafields.shipping_interval_unit_type;
        properties.charge_interval_frequency = variantOBJ.metafields.charge_internal_frequency;
        properties.subscription_id = variantOBJ.metafields.subscription_id;
      }

      Shopify.queue.push({
        quantity: 1,
        variantId: variantOBJ.id,
        properties,
      });

      // if there are selected product add-ons
      // push them also to the Shopify queue
      if (app.subscriptionFlow.productAddon.length > 0) {
        const properties = {};
        properties.cart_limit = null;
        app.subscriptionFlow.productAddon.forEach((product) => {
          Shopify.queue.push({
            quantity: 1,
            variantId: product.variants[0].id,
            properties,
          });
        });
      }

      Shopify.moveAlong = function() {
        // If we still have requests in the queue, let's process the next one.
        if (Shopify.queue.length) {
          const request = Shopify.queue.shift();

          axios.post('/cart/add.js', {
            quantity: request.quantity,
            id: request.variantId,
            properties: request.properties,
          })
            .then((response) => {
              Shopify.moveAlong();
              return response;
            })
            .catch((error) => {
              // console.log(error)
              if (Shopify.queue.length) {
                Shopify.moveAlong();
              }
              throw error;
            });
        } else {
          app._redirectToCheckout();
        }
      };

      if (app.subscriptionFlow.isGiftSub === 'true' && app.hasAutoRenew) {
        axios.post('/cart/clear.js')
          .then((response) => {
            Shopify.moveAlong();
            return response;
          })
          .catch((error) => {
            // console.log(error)
            throw error;
          });
      } else if (app.hasGiftSubscription) {
        axios.post('/cart/clear.js')
          .then((response) => {
            Shopify.moveAlong();
            return response;
          })
          .catch((error) => {
            // console.log(error)
            throw error;
          });
      } else {
        await Shopify.moveAlong();
      }
    },

    async _checkEmail(vEmail, eventType) {
      if (eventType !== 'subscription') {
        app.isLoading = true;
        app.loadingEvent = `cartAdding ${eventType}`;
      }
      app.giftEmail.emailValidateMsg = null;
      app.subscriptionFlow.giftType = eventType;

      if (app.subscriptionFlow.giftType === 'gift-recharge-immediately') {
        app.giftEmail.email = $('[data-gift-immidiate] [data-immidiate-email]').val();
        app.giftEmail.first_name = $('[data-gift-immidiate] [data-immidiate-firstname]').val();
        app.giftEmail.last_name = $('[data-gift-immidiate] [data-immidiate-last_name]').val();
        app.giftEmail.company = $('[data-gift-immidiate] [data-immidiate-company]').val();
        app.giftEmail.address1 = $('[data-gift-immidiate] [data-immidiate-address1]').val();
        app.giftEmail.address2 = $('[data-gift-immidiate] [data-immidiate-address2]').val();
        app.giftEmail.city = $('[data-gift-immidiate] [data-immidiate-city]').val();
        app.giftEmail.province = $('[data-gift-immidiate] [data-immidiate-province]').val();
        app.giftEmail.zip = $('[data-gift-immidiate] [data-immidiate-zip]').val();
        app.giftEmail.country = $('[data-gift-immidiate] [data-immidiate-country]').val();
        app.giftEmail.phone = $('[data-gift-immidiate] [data-immidiate-phone]').val();
        app.giftEmail.msg = '';
      } else {
        app.giftEmail.email = $('[data-gift-email] [data-giftemail-email]').val();
        app.giftEmail.date = $('[data-gift-email] [data-giftemail-date]').val();
        app.giftEmail.first_name = $('[data-gift-email] [data-giftemail-firstname]').val();
        app.giftEmail.last_name = $('[data-gift-email] [data-giftemail-lastname]').val();
        app.giftEmail.msg = $('[data-gift-email] [data-giftemail-msg]').val();
      }

      if(app._validateEmail(vEmail)){
        app.giftEmail.emailValidateMsg = null;
        if (app.subscriptionFlow.giftType === 'gift-recharge-immediately') {
          if (app.giftEmail.country === 'United States') {
            app._checkAddress(eventType);
          } else { app._addToCartSubscription(eventType); }
        } else { app._addToCartSubscription(eventType); }
      }
      else{
        app.isLoading = false;
        app.loadingEvent = null;
        app.giftEmail.emailValidateMsg = 'Email Address Is Not Valid.';
      }

      // const headers = {'X-Gift-Access-Token': '68c24ee0c9e84e75', Accept: 'application/json'};
      // await axios.post('https://gifting.hulkapps.com/gifts/check_email', {email: vEmail}, {headers})
      //   .then((response) => {
      //     if (response.data.status === 'error') {
      //       app.isLoading = false;
      //       app.loadingEvent = null;
      //       app.giftEmail.emailValidateMsg = response.data.message;
      //       return false;
      //     } else {
      //       app.giftEmail.emailValidateMsg = null;
      //       if (app.subscriptionFlow.giftType === 'gift-recharge-immediately') {
      //         if (app.giftEmail.country === 'United States') {
      //           app._checkAddress(eventType);
      //         } else { app._addToCartSubscription(eventType); }
      //       } else { app._addToCartSubscription(eventType); }
      //       return true;
      //     }
      //   })
      //   .catch((error) => {
      //     app.isLoading = false;
      //     app.loadingEvent = null;
      //     console.log(error);
      //   });
    },

    _checkAddress(eventType) {    
      const headers = {'X-Gift-Access-Token': '68c24ee0c9e84e75', Accept: 'application/json'};
      const config = {
        first_name: app.giftEmail.first_name,
        last_name: app.giftEmail.last_name,
        address1: app.giftEmail.address1,
        address2: app.giftEmail.address2,
        city: app.giftEmail.city,
        country: app.giftEmail.country,
        state: app.giftEmail.province,
        zipcode: app.giftEmail.zip,
      };

      axios.post('https://gifting.owlcrate.com/gifts/address_validation', config, {headers})
        .then((response) => {
          if (response.data.status === 'errors') {
            app.isLoading = false;
            app.loadingEvent = null;
            app._snotifyMsg('Error', response.data.message, 'Error');
            return false;
          } else { app._addToCartSubscription(eventType); return true; }
        })
        .catch((error) => {
          app.isLoading = false;
          app.loadingEvent = null;
          console.log(error);
        });
    },

    /**
     * Event to remove a variant from the cart
     *
     * @param  {number} itemId - line item index
     */
    _removeFromCart(itemIndex, event) {
      const $cartItem = $(event.currentTarget).parentsUntil(app.selectors.cartItem).parent();

      app.isLoading = true;
      $cartItem.addClass('updating');

      axios.post('/cart/change.js', {
        quantity: 0,
        line: itemIndex,
      })
        .then((response) => {
          app.isLoading = false;
          app._getCartData();
          $('[data-toggle="tooltip"]').tooltip('hide');
          window.location.reload();
          return response;
        })
        .catch((error) => {
          // console.log(error)
          throw error;
        });
    },

    /**
     * Event to update a variant in the cart
     *
     * @param  {number} itemIndex - line item index
     */
    _updateCart(itemIndex, event) {
      const $qtyEl = $(event.currentTarget).parentsUntil(app.selectors.qtyContainer).find(app.selectors.qtyInput);
      const $cartItem = $(event.currentTarget).closest(app.selectors.cartItem);
      const productCartLimit = $cartItem.data('cart-limit') || null;
      let qtyValue = $qtyEl.val();

      if ($(event.currentTarget).data('qty-decrease') !== undefined) {
        if (parseFloat(qtyValue) >= 2) {
          qtyValue = parseFloat(qtyValue) - 1;
        }
      } else if ($(event.currentTarget).data('qty-increase') !== undefined) {
        qtyValue = parseFloat(qtyValue) + 1;

        // check if item has product limit assigned
        if (app._productHasCartLimit(qtyValue, productCartLimit)) {
          return;
        }
      }

      app.isLoading = true;
      $cartItem.addClass('updating');

      $($qtyEl).parent().css({
        'pointer-events': 'none',
      });

      axios.post('/cart/change.js', {
        quantity: qtyValue,
        line: itemIndex,
      })
        .then((response) => {
          app._getCartData();
          app.isLoading = false;
          $cartItem.removeClass('updating');
          $($qtyEl).parent().css({
            'pointer-events': 'inherit',
          });
          return response;
        })
        .catch((error) => {
          // console.log(error)
          throw error;
        });
    },

    _productHasCartLimit(qtyValue, productCartLimit) {
      // console.log(`qtyValue: ${qtyValue}, productCartLimit: ${productCartLimit}`);
      if (productCartLimit) {
        if (qtyValue > productCartLimit) {
          app.$snotify.warning(`Product cart limit applies for the specific product variant. You can't purchase more than ${productCartLimit} item(s) per order.`, 'Product Limit', {
            timeout: 10000,
            showProgressBar: true,
            closeOnClick: true,
            pauseOnHover: true,
            buttons: [{
              text: 'Close',
              bold: true,
              closeOnClick: true,
              // action: (toast) => {
              //   app.$snotify.remove(toast.id);
              // },
            }],
          });
          return true;
        }
      }
      return false;
    },

    /**
     * ShippingCalculator
     */
    _initShippingCalculator() {
      const $form = $('[data-shipping-calculator]');
      if ($form.length === 0) {
        return;
      }

      const customerCountry = $form.find('select[name="country"]').data('value').trim();
      const customerProvince = $form.find('select[name="province"]').data('value').trim();
      const customerZip = $form.find('input[name="zip"]').data('value').trim();
      const userCountry = app._getCookie('user_country');
      const userProvince = app._getCookie('user_province');
      const today = new Date();
      const expirationDate = new Date();
      expirationDate.setDate(today.getDate() + 7);
      const time = expirationDate.getTime();
      const expireTime = time + 1000 * 36000;
      expirationDate.setTime(expireTime);

      if (customerCountry) { // if is user (is logged-in) show the user data
        app.selectedCountry = customerCountry;
        app.selectedProvince = customerProvince;
        app.selectedZip = customerZip;
      } else if (userCountry !== 'user_country' && userProvince !== 'user_province') { // else if cookie exists get from cookie
        app.selectedCountry = userCountry;
        app.selectedProvince = userProvince;
      } else { // finally if we don't have any data => get info from IP
        axios.get('https://geoip-db.com/json/')
          .then((response) => {
            app.selectedCountry = response.data.country_name;
            app.selectedProvince = response.data.region_name;
            // app.selectedZip = response.data.zip_code

            // set cookies
            document.cookie = `user_country=${response.data.country_name};expires=${expirationDate.toGMTString()};path=/`;
            document.cookie = `user_province=${response.data.region_name};expires=${expirationDate.toGMTString()};path=/`;
            return response;
          })
          .catch((error) => {
            // console.log(error)
            throw error;
          });
      }
    },

    _getCartShippingRates() {
      app.isLoading = true;

      axios.post('/cart/prepare_shipping_rates', {
        shipping_address: {
          country: app.selectedCountry,
          province: app.selectedProvince,
          zip: app.selectedZip,
        },
      })
        .then((response) => {
          app._pollCartShippingRates();
          return response;
        })
        .catch((error) => {
          // console.log(error.response.data)
          app.isLoading = false;
          app.shippingRatesErrors = error.response.data;
          throw error;
        });
    },

    _pollCartShippingRates() {
      axios.get('/cart/async_shipping_rates')
        .then((response) => {
          app.isLoading = false;
          if (response.data && response.data.shipping_rates) {
            app.shippingRates = response.data.shipping_rates;
          }
          return response;
        })
        .catch((error) => {
          // console.log(error)
          throw error;
        });
    },

    _redirectToCheckout() { 
      function reChargeGetCookie(name) {
        return (document.cookie.match(`(^|; )${name}=([^;]*)`) || 0)[2];
      }

        // Build the Checkout URL
      let ga_linker = '';
      const myshopify_domain = app.domain;
      const token = reChargeGetCookie('cart');
      try {
          // Cross-domain tracking with Google Analytics
        ga_linker = ga.getAll()[0].get('linkerParam');
      } catch (e) {
          // 'ga' is not available
        ga_linker = '';
      }

      let checkout_url = `https://checkout.owlcrate.com/r/checkout?myshopify_domain=${myshopify_domain}&cart_token=${token}&${ga_linker}`;
      let customer_param;
        // Customer email address for use in the Checkout URL
      if (app.customer != null) {
        customer_param = `customer_id=${app.customer.id}&customer_email=${app.customer.email}{% endif %}`;

        if (customer_param != null) { checkout_url = `https://checkout.owlcrate.com/r/checkout?myshopify_domain=${myshopify_domain}&cart_token=${token}&${ga_linker}&${customer_param}`; }
      }

      localStorage.setItem('selected_plan', null);
      localStorage.setItem('current_step', null);
      localStorage.setItem('selected_payment', null);

      app.isLoading = false;
      app.loadingEvent = null;

      setTimeout(() => {
        window.location.href = checkout_url;
      }, 500);
        // localStorage.setItem('gift_enabled', false);
    },

    /**
     * Vibrate mobile device
     */
    _vibrateDevice() {
      // check for vibration support
      const vibrationEnabled = navigator.vibrate || navigator.webkitVibrate || navigator.mozVibrate || navigator.msVibrate;
      if (vibrationEnabled) {
        navigator.vibrate(100);
      }
    },

    _validateCartHearAboutUsInputs(key) {
      switch (key) {
        case 'check':
          // check, add alerts
          if ( !this.hearAboutUs.value.length ){
            this.hearAboutUs.errorSelect = true;
            this.hearAboutUs.valid = false;
          } else if ( this.hearAboutUs.value == 'Other' && this.hearAboutUs.value2 == '' ) {
            this.hearAboutUs.errorInput = true;
            this.hearAboutUs.valid = false;
          } else {
            this.hearAboutUs.valid = true;
          }
          break;
        case 'input':
          // clear input error, made valid
          if (this.hearAboutUs.value2.length) {
            this.hearAboutUs.errorInput = false;
            this.hearAboutUs.valid = true;
          } else {
            this.hearAboutUs.errorInput = true;
            this.hearAboutUs.valid = false;
          }
          break;
        case 'select':
          // change select stay
          this.hearAboutUs.errorSelect = false;
          if ( this.hearAboutUs.value == 'Other' ) {
            this.hearAboutUs.valid = false;
          } else {
            this.hearAboutUs.valid = true;
          }
          break;
      }

    }

  },
};

export default cartMethods;
