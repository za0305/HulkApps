/**
 * Recharge methods
 * -----------------------------------------------------------------------------
 *
 * @namespace rechargeMethods
 */
import axios from 'axios';
import moment from 'moment';
import 'formdata-polyfill';

const rechargeCommonAPI = axios.create({
  baseURL: 'https://code.wolfpointagency.com/owlcratepp_recharge/api/common',
  headers: {
    Accept: 'application/json, text/javascript, /; q=0.01',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Cache-Control': 'must-revalidate',
    'Cache-Control': 'no-cache',
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
    crossDomain: true,
  },
});

const rechargeSUbAPI = axios.create({
  baseURL: 'https://code.wolfpointagency.com/owlcratepp_recharge/api/subscription',
  headers: {
    Accept: 'application/json, text/javascript, /; q=0.01',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'Content-Type': 'application/x-www-form-urlencoded; charset=UTF-8',
    'Cache-Control': 'must-revalidate',
    'Cache-Control': 'no-cache',
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
    crossDomain: true,
  },
});

const rechargeGiftAPI = axios.create({
  baseURL: 'https://gifting.hulkapps.com/gifts/pending_gifts',
  headers: {
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'X-Gift-Access-Token': '68c24ee0c9e84e75',
    'Cache-Control': 'must-revalidate',
    'Content-Type': 'application/json',
    'Cache-Control': 'no-cache',
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
    crossDomain: true,
  },
});

const rechargeMultipleClaimGiftAPI = axios.create({
  baseURL: 'https://gifting.hulkapps.com/gifts/claim_gifts',
  headers: {
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'X-Gift-Access-Token': '68c24ee0c9e84e75',
    'Cache-Control': 'must-revalidate',
    'Cache-Control': 'no-cache',
    'Cache-Control': 'no-store',
    'Content-Type': ' application/x-www-form-urlencoded; charset=UTF-8',
    Pragma: 'no-cache',
    crossDomain: true,
  },
});

const rechargeClaimGiftAPI = axios.create({
  baseURL: 'https://gifting.hulkapps.com/gifts/claim_gift',
  headers: {
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'X-Gift-Access-Token': '68c24ee0c9e84e75',
    'Cache-Control': 'must-revalidate',
    'Cache-Control': 'no-cache',
    'Cache-Control': 'no-store',
    'Content-Type': ' application/x-www-form-urlencoded; charset=UTF-8',
    Pragma: 'no-cache',
    crossDomain: true,
  },
});

const rechargeAddressValidation = axios.create({
  baseURL: 'https://gifting.hulkapps.com/gifts/address_validation',
  headers: {
    Accept: 'application/json',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': '*',
    'X-Gift-Access-Token': '68c24ee0c9e84e75',
    'Cache-Control': 'must-revalidate',
    'Cache-Control': 'no-cache',
    'Cache-Control': 'no-store',
    Pragma: 'no-cache',
    crossDomain: true,
  },
});

const rechargeMethods = {
  data() {
    return {
      isEditPaymentLoaded: false,
    };
  },
  methods: {

    // Init recharge method
    _initRecharge() {
      app._getCustomerID();
      app._getPendingGift(app.rechargeDashboard.customersID, app.rechargeDashboard.customerEmail, app.domain);
      app._intitalizePlan();
    },

    _intitalizePlan() {
      $('[data-sub-json]').each((index, item) => {
        const productObj = $(item).html();
        const productData = JSON.parse(productObj);
        productData.variant.metafields = productData.metafields;
        app.rechargeDashboard.subscriptionplans.push(productData.variant);
      });

      $('[data-old-sub-json]').each((index, item) => {
        const productObj = $(item).html();
        const productData = JSON.parse(productObj);
        productData.product.variants.forEach((x) => {
          productData.variants.forEach((y) => {
            if (x.id === y.id) {
              x.product_title = productData.product.title;
              x.product_id = productData.product.id;
              x.metafields = y.metafields;
              x.plan_variant_id = y.metafields.plan_variant_id;
              if (x.metafields.is_hidden == 'false') {
                app.rechargeDashboard.defaultPlans.push(x);
              }
            }
          });
        });
      });
    },

    // Get recharge customer's details API call
    async _getCustomerID() {
      const email = encodeURIComponent(app.rechargeDashboard.customerEmail);
      const config = {
        data: {
          // url: `/customers?email=${app.rechargeDashboard.customerEmail}`,
          url: `/customers?email=${email}`,
          method: 'GET',
        },
      };
      await rechargeCommonAPI.post(app.rechargeDashboard.API, config)
        .then((response) => {
          if (response.data.data.customers[0] === undefined) {
            app.rechargeDashboard.isgetsubscription = true;
            return false;
          } else {
            app.rechargeDashboard.customerDetails = response.data.data.customers[0];
            app._getSubscriptionAddresses();
            return true;
          }
        });
    },

    // Get customer subscription addresses API call
    async _getSubscriptionAddresses() {
      const config = {
        data: {
          url: `/customers/${app.rechargeDashboard.customerDetails.id}/addresses`,
          method: 'GET',
        },
      };
      await rechargeCommonAPI.post(app.rechargeDashboard.API, config)
        .then((response) => {
          app.rechargeDashboard.addresses = response.data.data.addresses;
          app._getSubscriptionHistory();
          app._getSubscriptionOrder();
          app._getAddonsOrders();
          return true;
        });
    },

    // Get subscriptions API call
    async _getSubscriptionOrder() {
      const config = {
        data: {
          shopify_customer_id: app.rechargeDashboard.customerDetails.shopify_customer_id,
          limit: 250,
        },
      };

      await rechargeSUbAPI.post(app.rechargeDashboard.getSubscriptionAPI, config)
        .then((response) => {
          app.rechargeDashboard.subscriptions = response.data.data.subscriptions;
          app.rechargeDashboard.isgetsubscription = true;
          app.rechargeDashboard.subscriptions.forEach((order, index) => {
            order.subscription_type = false;
            order.is_apply = false;
            if (order.properties.length > 0) {
              order.properties.forEach((x) => {
                if (x.name === 'Gift Type' || x.value === 'gift-recharge-autorenew') { order.subscription_type = true; }
                if (x.name === 'action_type') { order.is_apply = true; }
              });
            }

            if (order.status === 'ACTIVE') {
              const trans = [];
              app.rechargeDashboard.orderTransactions.forEach((orderH) => {
                if (orderH.status !== 'QUEUED') {
                  orderH.line_items.forEach((x) => {
                    if (x.subscription_id === order.id) {
                      const price = x.price * 100;
                      const obj = {
                        price,
                        status: orderH.status,
                        scheduled_at: orderH.scheduled_at,
                      };
                      trans.push(obj);
                    }
                  });
                }
              });
              if (trans.length > 0) {
                order.transaction_history_length = trans.length;
                order.transaction_history = trans;
              } else {
                order.transaction_history_length = 0;
                order.transaction_history = null;
              }
              app.rechargeDashboard.activeSubscription.push(order);
            } else { app.rechargeDashboard.unactiveSubscription.push(order); }
          });
          app._getUpcomingSub();
          return true;
        })
        .catch((error) => {
          app.isLoading = false;
          app.loadingEvent = null;
          // console.log(error);
        });
    },

    //  get addons order
    _getAddonsOrders() {
      const config = {
        data: {
          url: `/onetimes?customer_id=${app.rechargeDashboard.customerDetails.id}`,
          method: 'GET',
          data: {},
        },
      };

      rechargeCommonAPI.post(app.rechargeDashboard.API, config)
        .then((response) => {
          response.data.data.onetimes.forEach((order) => {
            const img = order.properties.find((x) => x.name === 'image');
            if (img === undefined) {
              order.featured_image = null;
            } else {
              order.featured_image = img.value;
            }
          });
          app.rechargeDashboard.addonsOrders = response.data.data.onetimes;
          return true;
        }).catch((error) => {
          throw error;
        });
    },

    // Get order transaction history API call
    async _getSubscriptionHistory() {
      const config = {
        data: {
          url: `/charges?customer_id=${app.rechargeDashboard.customerDetails.id}`,
          method: 'GET',
          data: {},
        },
      };

      await rechargeCommonAPI.post(app.rechargeDashboard.rechargeCommonAPI, config)
        .then((response) => {
          if (response.data.data.error) { return false; } else {
            app.rechargeDashboard.orderTransactions = response.data.data.charges;
            return true;
          }
        });
    },

    // get upcoming first subscription
    _getUpcomingSub() {
      app.rechargeDashboard.activeSubscription.forEach((order) => {
        if (!order.subscription_type) { app.rechargeDashboard.normalSubscription.push(order); }
      });

      const upcomingSub = app.rechargeDashboard.normalSubscription.sort((a, b) => {
        if (a.next_charge_scheduled_at !== null && b.next_charge_scheduled_at !== null) {
          if (new Date(a.next_charge_scheduled_at) < new Date(b.next_charge_scheduled_at)) { return -1; }
        }
      });
      app.rechargeDashboard.upcomingSub = upcomingSub[0];
    },

    // Get pending gift List API call
    _getPendingGift(id, email_id, domain) {
      rechargeGiftAPI.post('https://gifting.hulkapps.com/gifts/pending_gifts', {
        email: email_id,
        shop_id: domain,
      })
        .then((response) => {
          if (response.data !== null && response.data.unclaimed_gifts !== undefined) {
            if (response.data.unclaimed_gifts.length > 0) {
              app.claimGift.giftFound = true;
              app.claimGift.subscriptionGiftList = response.data.unclaimed_gifts;
              return true;
            }
          }
          return false;
        }).catch((error) => {
          throw error;
        });
    },

    // Check gift addres is enable or not
    _checkAddressEnabled(event, type, giftID) {
      const customerAddress = app.addresses;
      app.isLoading = true;
      app.claimGift.claimGiftType = type;
      if (customerAddress.length > 0) {
        if (app.claimGift.claimGiftType === 'multiple') {
          app.loadingEvent = 'claimAllGift';
          app._readMultipleClaimProduct();
        } else {
          app.loadingEvent = `activate_${giftID}`;
          app.claimGift.currentGiftID = giftID;
          app._readClaimProduct();
        }
      } else {
        app.isLoading = false;
        app.loadingEvent = null;
        app.claimGift.hasRechargeClaimPopup = true;
        setTimeout(() => {
          app._checkInputChange();
        }, 300);
        app.isOverlayVisible = true;
        app.claimGift.currentGiftID = giftID;
        app._lockScroll();
        setTimeout(() => {
          new Shopify.CountryProvinceSelector('country', 'administrative_area_level_1', {
            hideElement: 'province-wrap',
          });
          setTimeout(() => {
            const container = document.getElementsByClassName('pac-container')[0];
            container.addEventListener('touchstart', (e) => {
              e.stopImmediatePropagation();
              setTimeout(() => {
                document.activeElement.blur();
              }, 300);
            });
          }, 500);
          app._initAutocomplete();
        }, 300);
      }
    },

    // Enbled/disabled Claim modal save address button
    _checkInputChange() {
      $('[data-claim-form] [type="text"]').on('keyup blur change', function() {
        if ($.trim($('[data-claim-form] [data-gEmailFName]').val()) !== '' &&
      $.trim($('[data-claim-form] [data-gEmailLName]').val()) !== '' &&
      $.trim($('[data-claim-form] [data-gaddress1]').val()) !== '' &&
      $.trim($('[data-claim-form] [data-gcity]').val()) !== '' &&
      $.trim($('[data-claim-form] [data-gzip]').val()) !== '' &&
      $.trim($('[data-claim-form] [data-gcountry]').val()) !== '') {
          $(this).closest('form').find('[data-save-address]')
            .removeClass('disabled');
          app.claimGift.rechargeGiftForm.gEmailFName = $('[data-claim-form] [data-gEmailFName]').val();
          app.claimGift.rechargeGiftForm.gEmailLName = $('[data-claim-form] [data-gEmailLName]').val();
          app.claimGift.rechargeGiftForm.address1 = $('[data-claim-form] [data-gaddress1]').val();
          app.claimGift.rechargeGiftForm.address2 = $('[data-claim-form] [data-gaddress2]').val();
          app.claimGift.rechargeGiftForm.city = $('[data-claim-form] [data-gcity]').val();
          app.claimGift.rechargeGiftForm.zip = $('[data-claim-form] [data-gzip]').val();
          app.claimGift.rechargeGiftForm.province = $('[data-claim-form] [data-gprovince]').val();
          app.claimGift.rechargeGiftForm.country = $('[data-claim-form] [data-gcountry]').val();
          app.claimGift.rechargeGiftForm.phone = $('[data-claim-form] [data-gphone]').val();
        } else if ($(this).closest('form').find('[data-save-address]')
          .hasClass('disabled') === false) {
          $(this).closest('form').find('[data-save-address]')
            .addClass('disabled');
        }

      });

      $('[data-claim-form]').on('change', function() {
        $(this).closest('form').find('[data-save-address]')
          .removeClass('disabled');
      });

    },

    // single claim gift
    _readClaimProduct(first_name, last_name, address1, address2, city, country, state, zipcode, phone) {
      $('[data-site-overlay]').css('pointer-events', 'none');
      if (first_name !== undefined && last_name !== undefined && address1 !== undefined && city !== undefined && zipcode !== undefined) {
        const bodyFormData = new FormData();
        bodyFormData.set('email', app.rechargeDashboard.customerEmail);
        bodyFormData.set('shop_id', app.domain);
        bodyFormData.set('gift_id', app.claimGift.currentGiftID);
        bodyFormData.set('shipping_address[address1]', address1);
        bodyFormData.set('shipping_address[address2]', address2);
        bodyFormData.set('shipping_address[country]', country);
        bodyFormData.set('shipping_address[city]', city);
        bodyFormData.set('shipping_address[zip]', zipcode);
        bodyFormData.set('shipping_address[first_name]', first_name);
        bodyFormData.set('shipping_address[last_name]', last_name);
        bodyFormData.set('shipping_address[phone]', phone);
        bodyFormData.set('shipping_address[province]', state);

        rechargeClaimGiftAPI.post('https://gifting.hulkapps.com/gifts/claim_gift', bodyFormData).then((response) => {
          $('[data-site-overlay]').css('pointer-events', 'auto');
          if (response.data.status === 'errors') {
            app._snotifyMsg('Error', response.data.message, 'Error');
            app.isLoading = false;
            app.loadingEvent = null;
            return false;
          } else {
            app._getSubscriptionOrder();
            app._getPendingGift(app.rechargeDashboard.customersID, app.rechargeDashboard.customerEmail, app.domain);
            app.claimGift.hasRechargeClaimPopup = false;
            app.claimGift.currentGiftID = null;
            app.isLoading = false;
            app.loadingEvent = null;
            app._lockScroll();
          // app._snotifyMsg('CONGRATS!', 'Your gift has been claimed. We are fulfilling your order and we will email you when your gift is on it’s way!', 'Success');
            setTimeout(() => {
              app.claimGift.giftClaimedSuccessfully = true;
              app.isOverlayVisible = true;
            }, 500);
            return true;
          }
        }).catch((error) => {
          // console.log(error);
          return false;
        });
      } else {
        const customerAddress = app.addresses;
        const bodyFormData = new FormData();
        bodyFormData.set('email', app.rechargeDashboard.customerEmail);
        bodyFormData.set('shop_id', app.domain);
        bodyFormData.set('gift_id', app.claimGift.currentGiftID);
        bodyFormData.set('shipping_address[address1]', customerAddress[0].address1);
        bodyFormData.set('shipping_address[address2]', customerAddress[0].address2);
        bodyFormData.set('shipping_address[country]', customerAddress[0].country);
        bodyFormData.set('shipping_address[city]', customerAddress[0].city);
        bodyFormData.set('shipping_address[zip]', customerAddress[0].zip);
        bodyFormData.set('shipping_address[first_name]', customerAddress[0].first_name);
        bodyFormData.set('shipping_address[last_name]', customerAddress[0].last_name);
        bodyFormData.set('shipping_address[phone]', customerAddress[0].phone);
        bodyFormData.set('shipping_address[province]', customerAddress[0].province);

        rechargeClaimGiftAPI.post('https://gifting.hulkapps.com/gifts/claim_gift', bodyFormData).then((response) => {
          $('[data-site-overlay]').css('pointer-events', 'auto');
          if (response.data.status === 'errors') {
            app._snotifyMsg('Error', response.data.message, 'Error');
            app.isLoading = false;
            app.loadingEvent = null;
            return false;
          } else {
            app._getPendingGift(app.rechargeDashboard.customersID, app.rechargeDashboard.customerEmail, app.domain);
            app.claimGift.hasRechargeClaimPopup = false;
            app.claimGift.currentGiftID = null;
            app.isLoading = false;
            app.loadingEvent = null;
            app._getSubscriptionOrder();
            app._lockScroll();
            // app._snotifyMsg('CONGRATS!', 'Your gift has been claimed. We are fulfilling your order and we will email you when your gift is on it’s way!', 'Success');
            setTimeout(() => {
              app.claimGift.giftClaimedSuccessfully = true;
              app.isOverlayVisible = true;
            }, 500);
            return true;
          }
        }).catch((error) => {
          // console.log(error);
          return false;
        });
      }
    },

    // multiple claim gift
    _readMultipleClaimProduct(first_name, last_name, address1, address2, city, country, state, zipcode, phone) {
      $('[data-site-overlay]').css('pointer-events', 'none');
      if (first_name !== undefined && last_name !== undefined && address1 !== undefined && city !== undefined && zipcode !== undefined) {
        const bodyFormData = new FormData();
        bodyFormData.set('email', app.rechargeDashboard.customerEmail);
        bodyFormData.set('shop_id', app.domain);
        bodyFormData.set('shipping_address[address1]', address1);
        bodyFormData.set('shipping_address[address2]', address2);
        bodyFormData.set('shipping_address[country]', country);
        bodyFormData.set('shipping_address[city]', city);
        bodyFormData.set('shipping_address[zip]', zipcode);
        bodyFormData.set('shipping_address[first_name]', first_name);
        bodyFormData.set('shipping_address[last_name]', last_name);
        bodyFormData.set('shipping_address[phone]', phone);
        bodyFormData.set('shipping_address[province]', state);

        rechargeMultipleClaimGiftAPI.post('https://gifting.hulkapps.com/gifts/claim_gifts', bodyFormData).then((response) => {
          $('[data-site-overlay]').css('pointer-events', 'auto');
          if (response.data.status === 'errors') {
            app.isLoading = false;
            app.loadingEvent = null;
            app._snotifyMsg('Error', response.data.message, 'Error');
            return false;
          } else {
            app.isLoading = false;
            app.loadingEvent = null;
            app.claimGift.currentGiftID = null;
            app.claimGift.hasRechargeClaimPopup = false;
            app._lockScroll();
            // app._snotifyMsg('CONGRATS!', 'Your gift has been claimed. We are fulfilling your order and we will email you when your gift is on it’s way!', 'Success');
            app._getPendingGift(app.rechargeDashboard.customersID, app.rechargeDashboard.customerEmail, app.domain);
            app._getSubscriptionOrder();
            setTimeout(() => {
              app.claimGift.giftClaimedSuccessfully = true;
              app.isOverlayVisible = true;
            }, 500);
            return true;
          }
        }).catch((error) => {
          // console.log(error);
          return false;
        });
      } else {
        const customerAddress = app.addresses;
        const bodyFormData = new FormData();
        bodyFormData.set('email', app.rechargeDashboard.customerEmail);
        bodyFormData.set('shop_id', app.domain);
        bodyFormData.set('shipping_address[address1]', customerAddress[0].address1);
        bodyFormData.set('shipping_address[address2]', customerAddress[0].address2);
        bodyFormData.set('shipping_address[country]', customerAddress[0].country);
        bodyFormData.set('shipping_address[city]', customerAddress[0].city);
        bodyFormData.set('shipping_address[zip]', customerAddress[0].zip);
        bodyFormData.set('shipping_address[first_name]', customerAddress[0].first_name);
        bodyFormData.set('shipping_address[last_name]', customerAddress[0].last_name);
        bodyFormData.set('shipping_address[phone]', customerAddress[0].phone);
        bodyFormData.set('shipping_address[province]', customerAddress[0].province);

        rechargeMultipleClaimGiftAPI.post('https://gifting.hulkapps.com/gifts/claim_gifts', bodyFormData).then((response) => {
          $('[data-site-overlay]').css('pointer-events', 'auto');
          if (response.data.status === 'errors') {
            app.isLoading = false;
            app.loadingEvent = null;
            app._snotifyMsg('Error', response.data.message, 'Error');
            return false;
          } else {
            app.isLoading = false;
            app.loadingEvent = null;
            app.claimGift.hasRechargeClaimPopup = false;
            app.claimGift.currentGiftID = null;
            app._lockScroll();
          // app._snotifyMsg('CONGRATS!', 'Your gift has been claimed. We are fulfilling your order and we will email you when your gift is on it’s way!', 'Success');
            app._getPendingGift(app.rechargeDashboard.customersID, app.rechargeDashboard.customerEmail, app.domain);
            app._getSubscriptionOrder();
            setTimeout(() => {
              app.claimGift.giftClaimedSuccessfully = true;
              app.isOverlayVisible = true;
            }, 500);
            return true;
          }
        }).catch((error) => {
          // console.log(error);
          return false;
        });
      }
    },

    // add new gift address
    async _updateGiftAddress(event) {
      app.claimGift.submittedGift = true;

      app.isLoading = true;
      app.loadingEvent = 'nextStage';

      if (app.claimGift.rechargeGiftForm.gEmailFName !== undefined &&
      app.claimGift.rechargeGiftForm.gEmailLName !== undefined &&
      app.claimGift.rechargeGiftForm.address1 !== undefined &&
      app.claimGift.rechargeGiftForm.city !== undefined &&
      app.claimGift.rechargeGiftForm.zip !== undefined &&
      app.claimGift.rechargeGiftForm.country !== undefined
      // && app.claimGift.rechargeGiftForm.province != undefined
      // && app.claimGift.rechargeGiftForm.phone != undefined
      ) {
        app.claimGift.submittedGift = false;
        if (app.claimGift.rechargeGiftForm.country === 'United States') {
          await app._addressValidationRecharge(event);
          return true;
        } else { await app._addressClaim(app.claimGift.rechargeGiftForm.gEmailFName, app.claimGift.rechargeGiftForm.gEmailLName, app.claimGift.rechargeGiftForm.address1, app.claimGift.rechargeGiftForm.address2, app.claimGift.rechargeGiftForm.city, app.claimGift.rechargeGiftForm.country, app.claimGift.rechargeGiftForm.province, app.claimGift.rechargeGiftForm.zip, app.claimGift.rechargeGiftForm.phone); }
      } else {
        app.isLoading = false;
        app.loadingEvent = null;
      }
    },

    // Validate Us address
    async _addressValidationRecharge(event) {
      const countryVal = $('[data-country]').val();
      await rechargeAddressValidation.post('https://gifting.hulkapps.com/gifts/address_validation', {
        first_name: app.claimGift.rechargeGiftForm.gEmailFName,
        last_name: app.claimGift.rechargeGiftForm.gEmailLName,
        address1: app.claimGift.rechargeGiftForm.address1,
        address2: app.claimGift.rechargeGiftForm.address2,
        city: app.claimGift.rechargeGiftForm.city,
        country: app.claimGift.rechargeGiftForm.country,
        state: app.claimGift.rechargeGiftForm.province,
        zipcode: app.claimGift.rechargeGiftForm.zip,
        phone: app.claimGift.rechargeGiftForm.phone,
      }).then((response) => {
        if (response.data.status === 'errors') {
          app._snotifyMsg('Error', response.data.message, 'Error');
          app.isLoading = false;
          app.loadingEvent = null;
          return false;
        } else {
          app._addressClaim(app.claimGift.rechargeGiftForm.gEmailFName, app.claimGift.rechargeGiftForm.gEmailLName, app.claimGift.rechargeGiftForm.address1, app.claimGift.rechargeGiftForm.address2, app.claimGift.rechargeGiftForm.city, app.claimGift.rechargeGiftForm.country, app.claimGift.rechargeGiftForm.province, app.claimGift.rechargeGiftForm.zip, app.claimGift.rechargeGiftForm.phone);
          return true;
        }
      })
        .catch((error) => {
          app.isLoading = false;
          app.loadingEvent = null;
          throw error;
        });
    },

    // Claim address
    _addressClaim(first_name, last_name, address1, address2, city, country, state, zipcode, phone) {
      const data = $('[data-billing-address]').serialize();
      axios.post('/account/addresses', data).then((response) => {
        if (response.data.error) {
          app._snotifyMsg('Error', response.data.error, 'Error');
          app.isLoading = false;
          app.loadingEvent = null;
          return false;
        } else {
          if (app.claimGift.claimGiftType === 'multiple') {
            app._readMultipleClaimProduct(first_name, last_name, address1, address2, city, country, state, zipcode, phone);
          } else { app._readClaimProduct(first_name, last_name, address1, address2, city, country, state, zipcode, phone); }
          return true;
        }
      })
        .catch((error) => {
          app.isLoading = false;
          app.loadingEvent = null;
          // console.log(error);
        });
    },

    // single activate subscription call
    _activateSubscription(subId) {
      const config = {
        data: {
          url: `/subscriptions/${subId}/activate`,
          method: 'POST',
          data: {},
        },
      };
      app.isLoading = true;
      app.loadingEvent = `activate_${subId}`;

      axios.post(app.rechargeDashboard.API, config)
        .then((response) => {
          if (response.data.data.error) {
            app._snotifyMsg('Error', response.data.data.error, 'Error');
            return false;
          } else {
            app.isLoading = false;
            app.loadingEvent = null;
            window.location.reload();
            return true;
          }
        })
        .catch((error) => {
          app.isLoading = false;
          app.loadingEvent = null;
          // console.log(error);
        });
    },

    // Cancel subscription modal slide changes
    _cancelSubscription() {
      const comment = $('[data-cancellation-comment]').val();

      if ($('[data-cancellation-comment]').val() !== 'no_reason' && comment === '') {
        $('[data-cancellation-comment]').addClass('border-danger');
        app.isLoading = false;
        app.loadingEvent = null;
        return false;
      } else {
        $('[data-cancellation-comment]').removeClass('border-danger');

        if (app.rechargeDashboard.currentSubscription.charge_interval_frequency == 1) {
          app.rechargeDashboard.isSubscriptionCancelReason = false;
          setTimeout(() => {
            app.rechargeDashboard.monthlyCancelSub = true;
          }, 300);
        } else {
          app.rechargeDashboard.isSubscriptionCancelReason = false;
          setTimeout(() => {
            app.rechargeDashboard.prepaidSwitchCancelSub = true;
          }, 300);
        }
      }

      app._getCurrentProduct();
    },

    // toggle textarea for cancel reason
    _cancelReason(event) {
      if ($(event.currentTarget).val() === 'no_reason') {
        app.rechargeDashboard.isCancelOption = false;
      } else { app.rechargeDashboard.isCancelOption = true; }
    },

    // Cancel subscription API call
    _cancelSubscriptionAPI() {
      const comment = $('[data-cancellation-comment]').val();
      const reason = $('[data-cancellation-reason]').val();
      app.isLoading = true;
      app.loadingEvent = 'cancel_subScription';
      const config = {
        data: {
          url: `/subscriptions/${app.rechargeDashboard.currentSubscription.id}/cancel`,
          method: 'POST',
          data: {
            cancellation_reason: reason,
            cancellation_reason_comments: comment,
          },
        },
      };

      if (app.rechargeDashboard.currentSubscription.is_apply) {
        const configOffer = {
          subscription_id: app.rechargeDashboard.currentSubscription.id,
        };
        axios.post('https://s.wlfpt.co/owlcrate/remove_offer', configOffer)
          .then((response) => {
            app._cancelSubAPICall(config, 'cancel_subScription');
            return true;
          })
          .catch((error) => {
            // console.log(error);
          });
      } else {
        app._cancelSubAPICall(config, 'cancel_subScription');
      }
    },

    // Get updated shipping address API call
    _getShipAddress(addressId, eventType) {
      app.rechargeDashboard.isUpdateAddressModal = false;
      const config = {
        data: {
          url: `/addresses/${addressId}`,
          method: 'GET',
        },
      };

      rechargeCommonAPI.post(app.rechargeDashboard.API, config)
        .then((response) => {
          app.rechargeDashboard.address = response.data.data.address;
          setTimeout(() => {
            $(`#AddressCountry option[value="${app.rechargeDashboard.address.country}"]`).attr('selected', 'selected');
            $(`#AddressProvince option[value="${app.rechargeDashboard.address.province}"]`).attr('selected', 'selected');
            new Shopify.CountryProvinceSelector('AddressCountry', 'AddressProvince', {
              hideElement: 'AddressProvinceContainer',
            });
          }, 300);
          app._ChangeShippingAddress();
          return true;
        })
        .catch((error) => {
          // console.log(error);
        });
    },

    // Display edit address button
    _ChangeShippingAddress() {
      $('body').keyup('[data-address-box] input', () => {
        app.rechargeDashboard.isupdateAddress = true;
      });
      $('body').change('[data-address-box] select', () => {
        app.rechargeDashboard.isupdateAddress = true;
      });
    },

    // Update address API call
    _updateSubscriptionAddress() {
      app.isLoading = true;
      app.loadingEvent = 'updateAddress';
      const fname = $('[data-first-name]').val();
      const lname = $('[data-last-name]').val();
      const address1 = $('[data-address1]').val();
      const address2 = $('[data-address2]').val();
      const company = $('[data-company]').val();
      const city = $('[data-city]').val();
      const country = $('[data-country]').val();
      const zip = $('[data-zip]').val();
      const province = $('[data-province]').val();
      const phone = $('[data-phone]').val();
      let config;

      if (province === null) {
        config = {
          data: {
            url: `/addresses/${app.rechargeDashboard.address.id}`,
            method: 'PUT',
            data: {
              first_name: fname,
              last_name: lname,
              address1,
              address2,
              company,
              city,
              country,
              zip,
              phone,
            },
          },
        };
      } else {
        config = {
          data: {
            url: `/addresses/${app.rechargeDashboard.address.id}`,
            method: 'PUT',
            data: {
              first_name: fname,
              last_name: lname,
              address1,
              address2,
              company,
              city,
              country,
              zip,
              province,
              phone,
            },
          },
        };
      }

      rechargeCommonAPI.post(app.rechargeDashboard.API, config)
        .then((response) => {
          app.isLoading = false;
          app.loadingEvent = null;
          if (response.data.data.error) {
            app._snotifyMsg('Error', response.data.data.error, 'Error');
            return false;
          } else if (response.data.data.errors) {
            app._snotifyMsg('Error', response.data.data.errors, 'Error');
            if (response.data.data.errors.address1) { $('[data-address1]').addClass('border-danger'); }
            if (response.data.data.errors.first_name) { $('[data-first-name]').addClass('border-danger'); }
            if (response.data.data.errors.last_name) { $('[data-last-name]').addClass('border-danger'); }
            if (response.data.data.errors.city) { $('[data-city]').addClass('border-danger'); }
            if (response.data.data.errors.zip) { $('[data-zip]').addClass('border-danger'); }
            return false;
          } else {
            $('[data-address-box] input').removeClass('border-danger');
            app.rechargeDashboard.isupdateAddress = false;
            app.rechargeDashboard.isChangeAddress = true;
            app.rechargeDashboard.address = response.data.data.address;
            $('[data-modal-close]').trigger('click');
            app._snotifyMsg('Success', 'Your Address has been Updated Successfully', 'Success');
            return true;
          }
        })
        .catch((error) => {
          app.isLoading = false;
          app.loadingEvent = null;
          // console.log(error);
        });
    },

    // Get address type
    _addressType(eventType) {
      if (eventType === 'billing') {
        app.rechargeDashboard.addressType = 'billing';
      } else { app.rechargeDashboard.addressType = 'shipping'; }
    },

    // Get current product & variant selection
    _getCurrentProduct() {
      const currentProductID = app.rechargeDashboard.defaultPlans.find((x) => x.plan_variant_id === app.rechargeDashboard.currentSubscription.shopify_variant_id);
      app.rechargeDashboard.currentProduct = JSON.parse($(`[data-${currentProductID.product_id}-json]`).html()).product;
      app.rechargeDashboard.currentVariant = app.rechargeDashboard.currentProduct.variants.find((x) => x.id === currentProductID.id);
      JSON.parse($(`[data-${app.rechargeDashboard.currentProduct.id}-json]`).html()).variants.forEach((x) => {
        if (x.id === app.rechargeDashboard.currentVariant.id) {
          app.rechargeDashboard.currentVariant.metafields = x.metafields;
          app.rechargeDashboard.currentVariant.plan_variant_id = x.metafields.plan_variant_id;
        }

        app.rechargeDashboard.currentProduct.variants.forEach((y) => {
          if (y.id === x.id) {
            y.metafields = x.metafields;
            y.plan_variant_id = x.metafields.plan_variant_id;
          }
        });
      });

      $(`[data-swap-product-wrap] [data-${app.rechargeDashboard.currentProduct.id}] [data-input-${app.rechargeDashboard.currentProduct.id}]`).prop('checked', true);
      $(`[data-swap-product-wrap] [data-${app.rechargeDashboard.currentProduct.id}] [data-variant-${app.rechargeDashboard.currentVariant.id}]`).prop('checked', true);
    },

    // Select product event
    _changeProduct(event, productID) {
      app.rechargeDashboard.isUpdateSubscription = false;
      app.rechargeDashboard.updatedProduct = JSON.parse($(`[data-${productID}-json]`).html()).product;
      if (app.rechargeDashboard.updatedProduct.id !== app.rechargeDashboard.currentProduct.id) {
        app.rechargeDashboard.updatedVariant = app.rechargeDashboard.updatedProduct.variants[0];
        JSON.parse($(`[data-${productID}-json]`).html()).variants.forEach((x) => {
          if (x.id === app.rechargeDashboard.updatedVariant.id) {
            app.rechargeDashboard.updatedVariant.metafields = x.metafields;
            app.rechargeDashboard.updatedVariant.plan_variant_id = x.metafields.plan_variant_id;
          }
          app.rechargeDashboard.updatedProduct.variants.forEach((y) => {
            if (y.id === x.id) {
              y.metafields = x.metafields;
              y.plan_variant_id = x.metafields.plan_variant_id;
            }
          });
        });
        $(`[data-swap-product-wrap] [data-${app.rechargeDashboard.updatedProduct.id}] [data-input-${app.rechargeDashboard.updatedProduct.id}]`).prop('checked', true);
        $(`[data-swap-product-wrap] [data-${app.rechargeDashboard.updatedProduct.id}] [data-variant-${app.rechargeDashboard.updatedVariant.id}]`).prop('checked', true);
      } else {
        app.rechargeDashboard.updatedVariant = app.rechargeDashboard.currentVariant;
        $(`[data-swap-product-wrap] [data-${app.rechargeDashboard.updatedProduct.id}] [data-input-${app.rechargeDashboard.updatedProduct.id}]`).prop('checked', true);
        $(`[data-swap-product-wrap] [data-${app.rechargeDashboard.updatedProduct.id}] [data-variant-${app.rechargeDashboard.updatedVariant.id}]`).prop('checked', true);
      }
      if (app.rechargeDashboard.updatedVariant.id !== app.rechargeDashboard.currentVariant.id) { app.rechargeDashboard.isUpdateSubscription = true; }
    },

    // Change variant event
    _changeVariant(event, variantID, productID) {
      app.rechargeDashboard.updatedProduct = JSON.parse($(`[data-${productID}-json]`).html()).product;
      if (productID === app.rechargeDashboard.currentProduct.id) {
        app.rechargeDashboard.updatedVariant = app.rechargeDashboard.currentProduct.variants.find((x) => x.id === Number(variantID));
        JSON.parse($(`[data-${productID}-json]`).html()).variants.forEach((x) => {
          if (x.id === Number(variantID)) {
            app.rechargeDashboard.updatedVariant.metafields = x.metafields;
            app.rechargeDashboard.updatedVariant.plan_variant_id = x.metafields.plan_variant_id;
          }
        });
      } else {
        app.rechargeDashboard.updatedVariant = app.rechargeDashboard.updatedProduct.variants.find((x) => x.id === Number(variantID));
        JSON.parse($(`[data-${productID}-json]`).html()).variants.forEach((x) => {
          if (x.id === Number(variantID)) {
            app.rechargeDashboard.updatedVariant.metafields = x.metafields;
            app.rechargeDashboard.updatedVariant.plan_variant_id = x.metafields.plan_variant_id;
          }
        });
      }

      $(`[data-swap-product-wrap] [data-${app.rechargeDashboard.updatedProduct.id}] [data-variant-${app.rechargeDashboard.updatedVariant.id}]`).prop('checked', true);
      if (app.rechargeDashboard.updatedVariant.id === app.rechargeDashboard.currentVariant.id) {
        app.rechargeDashboard.isUpdateSubscription = false;
      } else { app.rechargeDashboard.isUpdateSubscription = true; }
    },

    // Update subscription API call
    _updateSubAPI(eventType) {
      app.isLoading = true;
      app.loadingEvent = 'change_subsciption';
      let updateConfig = {};
      let cancelConfig = null;
      let discountType = null;
      let discountVal = null;

      const changeSub = app.rechargeDashboard.subscriptionplans.find((x) => x.id === app.rechargeDashboard.updatedVariant.metafields.plan_variant_id);
      const price = app._formatMoney(Number(changeSub.price));
      changeSub.price = parseFloat(price.replace('$', ''));

      if (Number(app.rechargeDashboard.currentVariant.metafields.charge_internal_frequency) !== Number(app.rechargeDashboard.updatedVariant.metafields.charge_internal_frequency)) {
        updateConfig = {
          data: {
            url: '/subscriptions/',
            method: 'POST',
            data: {
              address_id: app.rechargeDashboard.currentSubscription.address_id,
              next_charge_scheduled_at: app.rechargeDashboard.currentSubscription.next_charge_scheduled_at,
              shopify_variant_id: changeSub.id,
              shopify_product_id: changeSub.metafields.product_id,
              product_title: changeSub.metafields.product_title,
              variant_title: changeSub.title,
              price: changeSub.price,
              order_interval_unit: app.rechargeDashboard.currentSubscription.order_interval_unit,
              order_interval_frequency: app.rechargeDashboard.updatedVariant.metafields.shipping_interval_frequency,
              charge_interval_frequency: app.rechargeDashboard.updatedVariant.metafields.charge_internal_frequency,
              sku: changeSub.sku,
              quantity: 1,
            },
          },
        };
        cancelConfig = {
          data: {
            url: `/subscriptions/${app.rechargeDashboard.currentSubscription.id}/cancel`,
            method: 'POST',
            data: {
              cancellation_reason: `Subscription upgraded to ${app.rechargeDashboard.updatedProduct.title}.`,
            },
          },
        };
      } else {
        updateConfig = {
          data: {
            url: `/subscriptions/${app.rechargeDashboard.currentSubscription.id}`,
            method: 'PUT',
            data: {
              shopify_variant_id: changeSub.id,
              shopify_product_id: changeSub.metafields.product_id,
              product_title: changeSub.metafields.product_title,
              variant_title: changeSub.title,
              price: changeSub.price,
              order_interval_unit: app.rechargeDashboard.currentSubscription.order_interval_unit,
              order_interval_frequency: app.rechargeDashboard.currentSubscription.order_interval_frequency,
              charge_interval_frequency: app.rechargeDashboard.currentSubscription.charge_interval_frequency,
              sku: changeSub.sku,
              quantity: 1,
            },
          },
        };
      }

      if (eventType === 'swap subscription') {
        discountType = 'switch';
        discountVal = app.rechargeDashboard.discountSwitch;
      }

      if (app.rechargeDashboard.currentSubscription.is_apply) {
        const configOffer = {
          subscription_id: app.rechargeDashboard.currentSubscription.id,
        };
        axios.post('https://s.wlfpt.co/owlcrate/remove_offer', configOffer)
          .then((response) => {
            app._updateSubAPICall(updateConfig, cancelConfig, discountType, discountVal, eventType);
            return true;
          })
          .catch((error) => {
            // console.log(error);
          });
      } else {
        app._updateSubAPICall(updateConfig, cancelConfig, discountType, discountVal, eventType);
      }
    },

    _updateSubAPICall(updateConfig, cancelConfig, discountType, discountVal, eventType) {
      rechargeCommonAPI.post(app.rechargeDashboard.API, updateConfig)
        .then((responseUpdate) => {
          if (responseUpdate.data.data.error) {
            app._snotifyMsg('Error', responseUpdate.data.data.error, 'Error');
            app.isLoading = false;
            app.loadingEvent = null;
            return false;
          } else if (Number(app.rechargeDashboard.currentVariant.metafields.charge_internal_frequency) !== Number(app.rechargeDashboard.updatedVariant.metafields.charge_internal_frequency)) {
            if (eventType === 'swap subscription' && discountVal != null) {
              const configDis = {
                subscription_id: responseUpdate.data.data.subscription.id,
                offer_type: discountVal,
                action_type: discountType,
              };
              axios.post('https://s.wlfpt.co/owlcrate/offers', configDis)
                .then((responseDis) => {
                  app.rechargeDashboard.prepaidSwitchCancelSub = false;
                  app._cancelSubAPICall(cancelConfig, eventType);
                  setTimeout(() => {
                    app.isLoading = false;
                    app.loadingEvent = null;
                    app.rechargeDashboard.monthlyConfirmation = true;
                  }, 300);
                  return true;
                })
                .catch((error) => {
                  app.isLoading = false;
                  app.loadingEvent = null;
                  // console.log(error);
                });
              return true;
            } else {
              app._cancelSubAPICall(cancelConfig, eventType);
              return true;
            }
          } else if (eventType === 'swap subscription') {
            app.isLoading = false;
            app.loadingEvent = null;
            app.rechargeDashboard.prepaidSwitchCancelSub = false;
            setTimeout(() => {
              app.rechargeDashboard.monthlyConfirmation = true;
            }, 300);
            return true;
          } else {
            window.location.href = '/account';
            return true;
          }
        })
        .catch((error) => {
          // console.log(error);
        });
    },

    _cancelSubAPICall(cancelConfig, eventType) {
      rechargeCommonAPI.post(app.rechargeDashboard.API, cancelConfig)
        .then((response) => {
          if (response.data.data.error) {
            // console.log(response.data.data.error);
            return false;
          } else if (eventType === 'swap subscription') {
            app.isLoading = false;
            app.loadingEvent = null;
            app.rechargeDashboard.prepaidSwitchCancelSub = false;
            setTimeout(() => {
              app.rechargeDashboard.monthlyConfirmation = true;
            }, 300);
            return true;
          } else {
            window.location.href = '/account'; return true;
          }
        })
        .catch((error) => {
          app.isLoading = false;
          app.loadingEvent = null;
          // console.log(error);
        });
    },

    // Get renewal date
    _getDate(eventType) {
      let nextChargeDate = app._formatDate(app.rechargeDashboard.currentSubscription.next_charge_scheduled_at);
      let SimplenextChargeDate = '';

      if (eventType === 'pause_subsciption') {
        nextChargeDate = moment(app.rechargeDashboard.currentSubscription.next_charge_scheduled_at).add(3, 'month').format('MMMM D, YYYY');
        SimplenextChargeDate = moment(app.rechargeDashboard.currentSubscription.next_charge_scheduled_at).add(3, 'month').format('Y-MM-DD');
      } else {
        nextChargeDate = moment(app.rechargeDashboard.currentSubscription.next_charge_scheduled_at).add(app.rechargeDashboard.currentSubscription.charge_interval_frequency, 'month').format('MMMM D, YYYY');
        SimplenextChargeDate = moment(app.rechargeDashboard.currentSubscription.next_charge_scheduled_at).add(app.rechargeDashboard.currentSubscription.charge_interval_frequency, 'month').format('Y-MM-DD');
      }
      app.rechargeDashboard.skip_shippment.dateFormate = nextChargeDate;
      app.rechargeDashboard.skip_shippment.nextChargeDate = `${SimplenextChargeDate}T00:00:00`;
    },

    // Update next charge date API call
    _updateNextChargeDate(eventType) {
      app.isLoading = true;
      let discountType;
      let discountVal = null;
      if (eventType === 'pause_subsciption') {
        app.loadingEvent = 'pause_subsciption';
        discountType = 'pause';
        discountVal = app.rechargeDashboard.discountPause;
        app._getDate('pause_subsciption');
      } else { app.loadingEvent = 'skip-shipment'; }

      const config = {
        data: {
          url: `/subscriptions/${app.rechargeDashboard.currentSubscription.id}/set_next_charge_date`,
          method: 'POST',
          data: {
            date: app.rechargeDashboard.skip_shippment.nextChargeDate,
          },
        },
      };

      rechargeCommonAPI.post(app.rechargeDashboard.API, config)
        .then((response) => {
          if (response.data.data.error) {
            app._snotifyMsg('Error', response.data.data.error, 'Error');
            return false;
          } else if (eventType === 'skip-shipment') {
            window.location.href = '/account';
            return true;
          } else {
            app.rechargeDashboard.pauseSubscription = response.data.data.subscription;
            if (discountVal != null) {
              const configDis = {
                subscription_id: app.rechargeDashboard.pauseSubscription.id,
                offer_type: discountVal,
                action_type: discountType,
              };

              axios.post('https://s.wlfpt.co/owlcrate/offers', configDis)
                .then((responseDis) => {
                  app.rechargeDashboard.monthlyCancelSub = false;
                  setTimeout(() => {
                    app.isLoading = false;
                    app.loadingEvent = null;
                    app.rechargeDashboard.pauseConfirmation = true;
                  }, 300);
                  return true;
                })
                .catch((error) => {
                  app.isLoading = false;
                  app.loadingEvent = null;
                  // console.log(error);
                });
            }
            return true;
          }
        })
        .catch((error) => {
          app.isLoading = false;
          app.loadingEvent = null;
          // console.log(error);
        });
    },

// Switch product event
    _swapSubscriptionVariant() {
      app.rechargeDashboard.updatedProduct = app.rechargeDashboard.currentProduct;
      app.rechargeDashboard.updatedVariant = app.rechargeDashboard.updatedProduct.variants.find((x) => Number(x.metafields.charge_internal_frequency) === Number(1));
      app._updateSubAPI('swap subscription');
    },

  // Add addons
    _addAddone(productID) {
      app.isLoading = true;
      app.loadingEvent = `add_${productID}`;
      const product = JSON.parse($(`[data-addon-${productID}]`).html());
      let config = {};
      product.variants[0].price = (product.variants[0].price / 100.0).toFixed(2);
      const productImg = app._getSizedImageUrl(product.featured_image, 'medium');

      if (Number(app.rechargeDashboard.upcomingSub.charge_interval_frequency) === Number(1)) {
        config = {
          data: {
            url: `/onetimes/address/${app.rechargeDashboard.upcomingSub.address_id}`,
            method: 'POST',
            data: {
              next_charge_scheduled_at: app.rechargeDashboard.upcomingSub.next_charge_scheduled_at,
              product_title: product.title,
              price: product.variants[0].price.replace('$', ''),
              quantity: 1,
              shopify_variant_id: product.variants[0].id,
              properties: [
                {
                  name: 'type',
                  value: 'addones',
                },
                {
                  name: 'variant-title',
                  value: product.variants[0].title,
                },
                {
                  name: 'image',
                  value: productImg,
                },
              ],
            },
          },
        };
        rechargeCommonAPI.post(app.rechargeDashboard.rechargeCommonAPI, config)
          .then((response) => {
            if (response.data.data.error) {
              app.isLoading = false;
              app.loadingEvent = null;
              app._snotifyMsg('Error', response.data.data.error, 'Error');
              return false;
            } else if (response.data.data.errors) {
              app.isLoading = false;
              app.loadingEvent = null;
              app._snotifyMsg('Error', response.data.data.errors, 'Error');
              return false;
            } else {
              app.isLoading = false;
              app.loadingEvent = null;
              app._snotifyMsg('Success', 'Your addones product will be shipped with your upcoming order.', 'Success');
              app._getAddonsOrders();
              return true;
            }
          }).catch((error) => {
            app.isLoading = false;
            app.loadingEvent = null;
            // console.log(error);
          });
      } else {
        const getDate = new Date();
        const getMonth = getDate.getMonth() + Number(1);
        const upcomingDate = new Date(app.rechargeDashboard.upcomingSub.next_charge_scheduled_at);
        const upcomingMonth = upcomingDate.getMonth() + Number(1);
        const currentAdd = app.rechargeDashboard.addresses.find((x) => x.id === app.rechargeDashboard.upcomingSub.address_id);

        if (getMonth === upcomingMonth) {
          config = {
            data: {
              url: `/onetimes/address/${app.rechargeDashboard.upcomingSub.address_id}`,
              method: 'POST',
              data: {
                next_charge_scheduled_at: app.rechargeDashboard.upcomingSub.next_charge_scheduled_at,
                product_title: product.title,
                price: product.variants[0].price.replace('$', ''),
                quantity: 1,
                shopify_variant_id: product.variants[0].id,
                properties: [
                  {
                    name: 'type',
                    value: 'addones',
                  },
                  {
                    name: 'variant-title',
                    value: product.variants[0].title,
                  },
                  {
                    name: 'image',
                    value: productImg,
                  },
                ],
              },
            },
          };

          rechargeCommonAPI.post(app.rechargeDashboard.rechargeCommonAPI, config)
            .then((response) => {
              if (response.data.data.error) {
                app.isLoading = false;
                app.loadingEvent = null;
                app._snotifyMsg('Error', response.data.data.error, 'Error');
                return false;
              } else if (response.data.data.errors) {
                app.isLoading = false;
                app.loadingEvent = null;
                app._snotifyMsg('Error', response.data.data.errors, 'Error');
                return false;
              } else {
                app.isLoading = false;
                app.loadingEvent = null;
                app._getAddonsOrders();
                app._snotifyMsg('Success', 'Your addones product will be shipped with your upcoming order.', 'Success');
                return true;
              }
            }).catch((error) => {
              app.isLoading = false;
              app.loadingEvent = null;
              // console.log(error);
            });
        } else {
          const month = upcomingDate.getMonth() + Number(1);
          let newDate;
          if (month < 10) {
            newDate = `${upcomingDate.getFullYear()}-0${month}-01`;
          } else { newDate = `${upcomingDate.getFullYear()}-${month}-01`; }

          if (currentAdd.province === null) {
            config = {
              data: {
                url: `/customers/${app.rechargeDashboard.customerDetails.id}/addresses`,
                method: 'POST',
                data: {
                  first_name: currentAdd.first_name,
                  last_name: currentAdd.last_name,
                  address1: currentAdd.address1,
                  address2: currentAdd.address2,
                  company: currentAdd.company,
                  city: currentAdd.city,
                  country: currentAdd.country,
                  zip: currentAdd.zip,
                  phone: currentAdd.phone,
                },
              },
            };
          } else {
            config = {
              data: {
                url: `/customers/${app.rechargeDashboard.customerDetails.id}/addresses`,
                method: 'POST',
                data: {
                  first_name: currentAdd.first_name,
                  last_name: currentAdd.last_name,
                  address1: currentAdd.address1,
                  address2: currentAdd.address2,
                  company: currentAdd.company,
                  city: currentAdd.city,
                  country: currentAdd.country,
                  province: currentAdd.province,
                  zip: currentAdd.zip,
                  phone: currentAdd.phone,
                },
              },
            };
          }

          rechargeCommonAPI.post(app.rechargeDashboard.API, config)
            .then((response) => {
              if (response.data.data.error) {
                app.isLoading = false;
                app.loadingEvent = null;
                app._snotifyMsg('Error', response.data.data.error, 'Error');
                return false;
              } else {
                const resAddress = response.data.data.address;
                const configSub = {
                  data: {
                    url: `/onetimes/address/${resAddress.id}`,
                    method: 'POST',
                    data: {
                      next_charge_scheduled_at: newDate,
                      product_title: product.title,
                      price: product.variants[0].price.replace('$', ''),
                      quantity: 1,
                      shopify_variant_id: product.variants[0].id,
                      properties: [
                        {
                          name: 'type',
                          value: 'addones',
                        },
                        {
                          name: 'variant-title',
                          value: product.variants[0].title,
                        },
                        {
                          name: 'image',
                          value: productImg,
                        },
                      ],
                    },
                  },
                };

                rechargeCommonAPI.post(app.rechargeDashboard.rechargeCommonAPI, configSub)
                  .then((response) => {
                    if (response.data.data.error) {
                      app.isLoading = false;
                      app.loadingEvent = null;
                      app._snotifyMsg('Error', response.data.data.error, 'Error');
                      return false;
                    } else if (response.data.data.errors) {
                      app.isLoading = false;
                      app.loadingEvent = null;
                      app._snotifyMsg('Error', response.data.data.errors, 'Error');
                      return false;
                    } else {
                      app.isLoading = false;
                      app.loadingEvent = null;
                      app._snotifyMsg('Success', 'Your addones product will be shipped with your upcoming order.', 'Success');
                      app._getAddonsOrders();
                      return true;
                    }
                  })
                  .catch((error) => {
                    app.isLoading = false;
                    app.loadingEvent = null;
                    return error;
                  });
                return true;
              }
            })
            .catch((error) => {
              app.isLoading = false;
              app.loadingEvent = null;
              return error;
            });
        }
      }
    },

  // Cancel addon
    _cancelAddons(productID) {
      app.isLoading = true;
      app.loadingEvent = `cancel_${productID}`;
      const config = {
        data: {
          url: `/onetimes/${productID}`,
          method: 'DELETE',
          data: {},
        },
      };

      rechargeCommonAPI.post(app.rechargeDashboard.rechargeCommonAPI, config)
        .then((response) => {
          if (response.data.data === null) {
            app.isLoading = false;
            app.loadingEvent = null;
            app._snotifyMsg('Success', 'Your product is successfully removed.', 'Success');
            window.location.reload();
            return true;
          } else if (response.data.data.error) {
            app.isLoading = false;
            app.loadingEvent = null;
            app._snotifyMsg('Error', response.data.data.error, 'Error');
            return false;
          } else {
            app.isLoading = false;
            app.loadingEvent = null;
            app._snotifyMsg('Success', 'Your product is successfully removed.', 'Success');
            setTimeout(() => {
              window.location.reload();
            }, 300);
            return true;
          }
        })
        .catch((error) => {
          app.isLoading = false;
          app.loadingEvent = null;
          return error;
        });

    },

  // expand Transaction list
    _expandHistory(orderId) {
      $(`[data-subcription=${orderId}] [data-history-lists] [data-history-list]:hidden`).removeClass('d-none').addClass('d-flex');
      $(`[data-expand-btn][data-expand-id=${orderId}]`).hide();
    },

// Change modal event
    _changeModal(event, currentModal) {
      app.isUpdateAddressModal = false;
      app.rechargeDashboard.isChooseOpt = false;
      switch (currentModal) {
        case 'cancel-subscription-reason':
          app.rechargeDashboard.isSubscriptionCancelReason = true;
          break;
        case 'skip-shipment':
          app.rechargeDashboard.isSkipShipment = true;
          app._getDate('skip-shipment');
          break;
        case 'switch-plan':
          app.rechargeDashboard.isSwitchPlan = true;
          app.rechargeDashboard.isUpdateSubscription = false;
          app._getCurrentProduct();
          break;
        case 'confirm-subscription-update':
          app.rechargeDashboard.isSwitchPlan = false;
          setTimeout(() => {
            app.rechargeDashboard.isConfirmSubscriptionUpdate = true;
          }, 200);
          break;
        case 'editPayment':
          app.rechargeDashboard.isEditPayment = true;
          $('[data-edit-payment] [data-recharge-payment-form]').html(`<iframe width="100%" src="https://shopifysubscriptions.com/customer_portal_forms/${app.rechargeDashboard.customerDetails.hash}/customer_card" name="payment-form" id="payment-form"></iframe>`);
          setTimeout(() => {
            $('[data-edit-payment] [data-recharge-payment-form]').removeClass('d-none').addClass('d-block');
            app.isEditPaymentLoaded = true;
          }, 300);
          break;
      }
    },

// Reset flags
    _toggleRechargeDrawer(event, index) {
      app.isLoading = false;
      app.loadingEvent = null;
      app.rechargeDashboard.isChooseOpt = true;
      app.rechargeDashboard.currentSubscription = app.rechargeDashboard.activeSubscription[index];
      app.rechargeDashboard.currentAddressSubscription = app.rechargeDashboard.addresses[index];
      app.rechargeDashboard.isSubscriptionCancelReason = false;
      app.rechargeDashboard.monthlyCancelSub = false;
      app.rechargeDashboard.prepaidSwitchCancelSub = false;
      app.rechargeDashboard.monthlyCancelSub = false;
      app.rechargeDashboard.isSkipShipment = false;
      app.rechargeDashboard.isSwitchPlan = false;
      app.rechargeDashboard.isConfirmSubscriptionUpdate = false;
      app.rechargeDashboard.pauseConfirmation = false;
      app.rechargeDashboard.isCancelOption = false;
      app.rechargeDashboard.monthlyConfirmation = false;
      app.rechargeDashboard.isEditPayment = false;

      $('[data-cancellation-reason]').val('no_reason').trigger('change');
      $('[data-cancellation-comment]').val('');
    },

// Close gift modal event
    _closeModal(event) {
      app.claimGift.giftClaimedSuccessfully = false;
      app.claimGift.hasRechargeClaimPopup = false;
      app.isOverlayVisible = false;
      app._unlockScroll();
    },

  // close recharge modal event
    _closePopup(eventType) {
      switch (eventType) {
        case 'monthlyConfirmation':
          window.location.reload();
          break;
      }
    },

    _scrollTop() {
      if ($('#subscriptions:hidden').length > 0) { app._changeTab(); } else {
        $('html, body').animate({
          scrollTop: 0,
        }, 600);
      }
    },

  // go back modal
    _goback(step, popupName) {
      app.isLoading = false;
      app.loadingEvent = null;
      switch (popupName) {
        case 'cancel-reason':
          app.rechargeDashboard.isSubscriptionCancelReason = false;
          setTimeout(() => {
            app.rechargeDashboard.isChooseOpt = true;
          }, 200);
          break;
        case 'cancel-prepaid':
          app.rechargeDashboard.prepaidSwitchCancelSub = false;
          app.rechargeDashboard.monthlyCancelSub = false;
          setTimeout(() => {
            app.rechargeDashboard.isSubscriptionCancelReason = true;
          }, 200);
          break;
        case 'cancel-monthly':
          app.rechargeDashboard.monthlyCancelSub = false;
          setTimeout(() => {
            app.rechargeDashboard.isSubscriptionCancelReason = true;
          }, 200);
          break;
        case 'switch-plan':
          app.rechargeDashboard.isConfirmSubscriptionUpdate = false;
          setTimeout(() => {
            app.rechargeDashboard.isSwitchPlan = true;
          }, 200);
          break;
      }
    },

  // change date format for recharge
    _formatDateRecharge(value) {
      const date = moment(value).format('MMM D, YYYY');
      return date;
    },

  // change date format for recharge
    _formatDateDisplay(value) {
      const date = moment(value).format('ddd MMM D, YYYY');
      return date;
    },

  },
};

export default rechargeMethods;
