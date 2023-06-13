/**
 * Subscription methods
 * -----------------------------------------------------------------------------
 *
 * @namespace subscriptionMethods
 */

import detectIt from 'detect-it';
import Flickity from 'flickity';


let autocomplete;
const filter = /^([a-zA-Z0-9_.-])+\@(([a-zA-Z0-9-])+.)+([a-zA-Z0-9]{2,4})+$/;
const componentForm = {
  street_number: 'short_name',
  route: 'long_name',
  locality: 'long_name',
  administrative_area_level_1: 'long_name',
  country: 'long_name',
  postal_code: 'short_name',
};

const subscriptionMethods = {
  data() {
    return {};
  },
  methods: {
    _initSubscribeMethods() {
      if (app.currentTemplate === 'subscription-plan') {
        let plan = window.location.search;
        if (plan !== '' && plan !== undefined && plan === '?ocjr') {
          plan = plan.replace('?', '');
          localStorage.setItem('selected_plan', 'plan_jr');
          app._choosePlan('plan_jr', 2, 'type-normal');
          localStorage.setItem('selected_payment', null);
        } else if (plan !== '' && plan !== undefined && plan === '?oc') {
          plan = plan.replace('?', '');
          localStorage.setItem('selected_plan', 'plan_adult');
          localStorage.setItem('selected_payment', null);
          app._choosePlan('plan_adult', 2, 'type-normal');
        }

        if (localStorage.getItem('selected_plan') === 'null' && localStorage.getItem('selected_payment') === 'null') { window.location.href = '/pages/subscribe'; }
      }

      if (app.currentTemplate !== 'subscription-plan') { localStorage.setItem('is_gift', 'false'); }

      if (app.currentTemplate === 'index') {
        if ($('[data-sub-json]').length > 0) {
          if ($('[data-selectedPlanType]').length > 0) { app._initPlanType(); }
          app._initProducts();
        } else { app.subscriptionFlow.subscriptionPlan = null; }
        localStorage.setItem('selected_payment', null);
        localStorage.setItem('is_gift', 'false');
        localStorage.setItem('current_step', 1);
      }

      if (app.currentTemplate !== 'subscription-plan' && app.currentTemplate !== 'box-subscription') { return; }

      app.subscriptionFlow.isGiftSub = localStorage.getItem('is_gift');

        // Intialize selected plan
      if (app.currentTemplate === 'box-subscription') {
        if ($('[data-selectedPlanType]').length > 0) { app._initPlanType(); }
      } else {
        app.subscriptionFlow.currentStep = localStorage.getItem('current_step');
        if (localStorage.getItem('selected_payment') && Number(app.subscriptionFlow.currentStep) === 3) { app._initSubscriptionPayment(); }
      }

      if (localStorage.getItem('selected_plan') !== null) {
        app.subscriptionFlow.selectedPlanType = localStorage.getItem('selected_plan');
        if (app.subscriptionFlow.selectedPlanType === 'plan_jr') {
          app.subscriptionFlow.addonType = 'box_junior';
        } else {
          app.subscriptionFlow.addonType = 'box_adult';
        }
        if ($('[data-sub-json]').length > 0) { app._initProducts(); }
      }

      if (localStorage.getItem('selected_plan') !== 'null') { app.subscriptionFlow.currentStep = localStorage.getItem('current_step'); }

      if ($(window).width() > 767 && Number(app.subscriptionFlow.currentStep) === 2) {
        setTimeout(() => {
          let cardText = 0;
          $('[data-plan-wrap]').each(function() {
            if ($(this).find('[data-card-total]').height() > cardText) { cardText = $(this).find('[data-card-total]').height(); }
          });
          $('[data-plan-wrap] [data-card-total]').height(cardText);
        }, 500);
      }
    },

    _initPlanType() {
      const type = $('[data-selectedPlanType]').attr('data-selectedPlanType');
      localStorage.setItem('selected_plan', type);
      app.subscriptionFlow.selectedPlanType = type;
      if (app.subscriptionFlow.selectedPlanType === 'plan_adult') {
        app.subscriptionFlow.addonType = 'box_adult';
      } else {
        app.subscriptionFlow.addonType = 'box_junior';
      }
    },

    // Initialize products
    _initProducts() {
      if (app.currentTemplate == 'box-subscription') {
        app.subscriptionFlow.selectedPlanType = $('[data-selectedPlanType]').attr('data-selectedPlanType');
      }

      $('[data-sub-json]').each((index, item) => {
        const productObj = $(item).html();
        const productData = JSON.parse(productObj);
        productData.variant.metafields = productData.metafields;
        productData.variant.product_id = productData.product.product_id;
        productData.variant.product_title = productData.product.product_title;
        productData.variant.product_price = productData.product.product_price;
        productData.variant.product_featured_image = productData.product.product_featured_image;
        productData.variant.selling_plan = productData.product.selling_plan;
        productData.variant.product_type = productData.product.product_type;
        productData.variant.product_tags = productData.product.product_tags;
        productData.variant.is_hidden = productData.variant.metafields.is_hidden;
        productData.variant.addonType = productData.product.addonType;
        productData.variant.save = Number((productData.variant.product_price * productData.variant.metafields.charge_internal_frequency) - productData.variant.price);

        app.subscriptionFlow.subscriptionPlans.push(productData.variant);
      });

      if (app.currentTemplate === 'index') {
        app.subscriptionFlow.subscriptionPlanJson = app.subscriptionFlow.subscriptionPlans;
      }

      if (app.subscriptionFlow.selectedPlanType !== 'null' && app.currentTemplate !== 'index') {
        app._getPlan();
      }
    },

    _getPlan() {
      const newArr = $.grep(app.subscriptionFlow.subscriptionPlans, (n, i) => {
        return n.product_type === app.subscriptionFlow.selectedPlanType;
      });
      app.subscriptionFlow.subscriptionPlanJson = newArr;
    },

    // Choose gift product from Owlcrate subscription page
    _chooseGiftProductOnPage(eventType) {
      localStorage.setItem('is_gift', true);
      localStorage.setItem('current_step', 2);
      if (eventType === 'type-gift') {
        localStorage.setItem('is_gift', 'true');
      } else {
        localStorage.setItem('is_gift', 'false');
      }
      setTimeout(() => {
        window.location.href = '/pages/subscription-plan';
      }, 300);
    },

    // Selected Plans
    _selectedPlan(variant) { 
      localStorage.setItem('selected_payment', JSON.stringify(variant));
      localStorage.setItem('current_step', 3);
      app.subscriptionFlow.subscriptionPayment = variant;
      setTimeout(() => {
        app._nextStage(2, 3);
      }, 100);
    },

    // Initialize Sub. Plan
    _initSubscriptionPayment() {
      const selectedPayment = localStorage.getItem('selected_payment');
      app.subscriptionFlow.subscriptionPayment = JSON.parse(selectedPayment);
      if (app.subscriptionFlow.subscriptionPlan != null && app.subscriptionFlow.subscriptionPayment != null) {
        setTimeout(() => {
          app._nextStage(2, 3);
        }, 100);
      }
    },

    // Select Plan
    _chooseProductOnPage(handle, step, eventType) {
      if (eventType === 'type-gift') {
        localStorage.setItem('is_gift', 'true');
      } else {
        localStorage.setItem('is_gift', 'false');
      }

      localStorage.setItem('current_step', 2);
      localStorage.setItem('selected_plan', handle);
      window.location.href = '/pages/subscription-plan';
    },

    // Select Plan
    _choosePlan(handle, step, eventType) {
      if (eventType === 'type-gift') {
        localStorage.setItem('is_gift', 'true');
      } else {
        localStorage.setItem('is_gift', 'false');
      }

      localStorage.setItem('current_step', 2);
      localStorage.setItem('selected_plan', handle);
    },

    _selectedPagePlan(variant) {
      localStorage.setItem('selected_payment', JSON.stringify(variant));
      localStorage.setItem('current_step', 3);
      setTimeout(() => {
        window.location.href = '/pages/subscription-plan';
      }, 100);
    },

    _choosePagePlan(productID, eventType) {
      const productObj = $(`[data-plan-json][data-product-id="${productID}"]`).html();
      const productData = JSON.parse(productObj);
      productData.variant.metafields = productData.metafields;
      productData.variant.product_id = productData.product.product_id;
      productData.variant.product_title = productData.product.product_title;
      productData.variant.product_price = productData.product.product_price;
      productData.variant.product_featured_image = productData.product.product_featured_image;
      productData.variant.product_type = productData.product.product_type;
      productData.variant.product_tags = productData.product.product_tags;
      productData.variant.is_hidden = productData.variant.metafields.is_hidden;
      productData.variant.addonType = productData.product.addonType;
      productData.variant.save = Number((productData.variant.product_price * productData.variant.metafields.charge_internal_frequency) - productData.variant.price);
      const variantJson = productData.variant;

      localStorage.setItem('selected_plan', eventType);
      localStorage.setItem('selected_payment', JSON.stringify(variantJson));
      localStorage.setItem('current_step', 3);
      setTimeout(() => {
        window.location.href = '/pages/subscription-plan';
      }, 100);
    },

    _getSubTotal() {
      app.subscriptionFlow.subTotal = app.subscriptionFlow.subscriptionPayment.price;
      let addonTotal = 0;
      if (app.subscriptionFlow.productAddon.length > 0) {
        $.map(app.subscriptionFlow.productAddon, (value, key) => {
          addonTotal += parseInt(value.price);
          return addonTotal;
        });
        app.subscriptionFlow.subTotal = app.subscriptionFlow.subscriptionPayment.price + addonTotal;
      }
    },

    _chooseAddons(product) {
      let productJson;
      if (app.subscriptionFlow.addonType === 'box_adult') {
        productJson = $.parseJSON($(`[data-addon-adult-${product}]`).html());
      } else if (app.subscriptionFlow.addonType === 'box_junior') {
        productJson = $.parseJSON($(`[data-addon-junior-${product}]`).html());
      }

      app.subscriptionFlow.productAddon.push(productJson);
      app._getSubTotal();
      $(`[data-addon-list=${product}] [data-add]`).addClass('d-none');
      $(`[data-addon-list=${product}] [data-remove]`).removeClass('d-none');
    },

    _removeAddons(product) {
      const newArr = $.grep(app.subscriptionFlow.productAddon, (n, i) => {
        return n.handle !== product;
      });
      app.subscriptionFlow.productAddon = newArr;
      app._getSubTotal();
      $(`[data-addon-list=${product}] [data-remove]`).addClass('d-none');
      $(`[data-addon-list=${product}] [data-add]`).removeClass('d-none');
    },

    _nextStage(current_step, nextStep) {
      $(`[data-step="${nextStep}"]`).removeClass('d-none');
      $(`[data-step="${current_step}"]`).addClass('d-none');
      switch (nextStep) {
        case 2:
          break;
        case 3:
          $('html, body').animate({
            scrollTop: 0,
          }, 600);
          if (app.subscriptionFlow.isGiftSub !== 'true') {
            $('[data-addons-wrap], [data-checkout-wrap]').css('opacity', '0');
            let cardText = 0;
            $('[data-addons-section] [data-addon-list]').each(function() {
              if ($(this).find('[data-product-title]').height() > cardText) { cardText = $(this).find('[data-product-title]').height(); }
            });
            $('[data-addons-section] [data-addon-list] [data-product-title]').height(cardText);
            const flky = new Flickity('[data-addons-section]', {
              contain: true,
              wrapAround: false,
              groupCells: '100%',
              dragThreshold: 20,
              lazyLoad: true,
              prevNextButtons: true,
              pageDots: false,
              arrowShape: {x0: 10, x1: 60, y1: 50, x2: 65, y2: 40, x3: 25},
            });
            flky.resize();

            setTimeout(() => {
              $('[data-addons-wrap], [data-checkout-wrap]').css('opacity', '1');
            }, 300);
          } else {
            if ($('[data-delivery-option]').hasClass('opened')) {
              $('[data-delivery-option]').removeClass('opened after-open');
              $('[data-delivery-option]').addClass('before-open');
            }
            new Shopify.CountryProvinceSelector('country', 'administrative_area_level_1', {
              hideElement: 'province-wrap',
            });

            app._giftValidation();
            app._initAutocomplete();
          }
          app._getSubTotal();
          break;
        case 4:
          break;
      }
    },

    _prevStage(event, current_step, prevStep) {
      switch (prevStep) {
        case 1:
          app.subscriptionFlow.subscriptionPlan = null;
          app.subscriptionFlow.featured_image = null;
          app.subscriptionFlow.subscriptionPayment = null;
          app.subscriptionFlow.productAddon = [];
          localStorage.setItem('selected_payment', null);
          localStorage.setItem('current_step', 1);
          if (app.subscriptionFlow.isGiftSub === 'true') {
            window.location.href = '/pages/gift';
          } else {
            window.location.href = '/pages/subscribe';
          }
          break;
        case 2:
          $(`[data-step="${current_step}"]`).addClass('d-none');
          $(`[data-step="${prevStep}"]`).removeClass('d-none');
          app.subscriptionFlow.subscriptionPayment = null;
          localStorage.setItem('selected_payment', null);
          localStorage.setItem('current_step', 2);
            // app.subscriptionFlow.productAddon = [];
          app.subscriptionFlow.subTotal = 0.00;
          if ($(window).width() > 767) {
            setTimeout(() => {
              let cardText = 0;
              $('[data-plan-wrap]').each(function() {
                if ($(this).find('[data-card-total]').height() > cardText) { cardText = $(this).find('[data-card-total]').height(); }
              });
              $('[data-plan-wrap] [data-card-total]').height(cardText);
            }, 500);
          }
          break;
        case 3:
          break;
      }
    },

    _giftRenew(event) {
      if ($(event.currentTarget).is(':checked')) {
        app.subscriptionFlow.giftRenew = true;
        $('[data-delivery-option]').removeClass('after-open opened');
      } else {
        app.subscriptionFlow.giftRenew = false;
      }
    },

    // Disabled checkout button untill all required fields gets filled
    _giftValidation() {
      $('[data-giftemail] input, [data-giftemail] textarea').on('keyup blur change', () => {
        if ($.trim($('[data-giftemail] [data-giftemail-date]').val()) !== '' &&
                $.trim($('[data-giftemail] [data-giftemail-firstname]').val()) !== '' &&
                $.trim($('[data-giftemail] [data-giftemail-lastname]').val()) !== '' &&
                $.trim($('[data-giftemail] [data-giftemail-email]').val()) !== '') {
          $('[data-giftemail] [data-checkout]').removeClass('disabled');
        } else if ($('[data-giftemail] [data-checkout]').hasClass('disabled') === false) {
          $('[data-giftemail] [data-checkout]').addClass('disabled');
        }
      });

      $('[data-gift-immidiate] input, [data-gift-immidiate] textarea, [data-gift-immidiate] select').on('keyup blur change', () => {
        if ($.trim($('[data-gift-immidiate] [data-immidiate-firstname]').val()) !== '' &&
                    $.trim($('[data-gift-immidiate] [data-immidiate-last_name]').val()) !== '' &&
                    $.trim($('[data-gift-immidiate] [data-immidiate-address1]').val()) !== '' &&
                    $.trim($('[data-gift-immidiate] [data-immidiate-email]').val()) !== '' &&
                    $.trim($('[data-gift-immidiate] [data-immidiate-city]').val()) !== '' &&
                    $.trim($('[data-gift-immidiate] [data-immidiate-zip]').val()) !== '' &&
                    $.trim($('[data-gift-immidiate] [data-immidiate-country]').val()) !== '' &&
                    $.trim($('[data-gift-immidiate] [data-immidiate-phone]').val()) !== '') {
          if ($('[data-gift-immidiate] [data-immidiate-country]').val() === '---') {
            $('[data-gift-immidiate] [data-immidiate-country]').addClass('border-danger');
            if ($('[data-gift-immidiate] [data-checkout]').hasClass('disabled') === false) { $('[data-gift-immidiate] [data-checkout]').addClass('disabled'); }
          } else {
            $('[data-gift-immidiate] [data-immidiate-country]').removeClass('border-danger');
            $('[data-gift-immidiate] [data-checkout]').removeClass('disabled');
          }
        } else if ($('[data-gift-immidiate] [data-checkout]').hasClass('disabled') === false) { $('[data-gift-immidiate] [data-checkout]').addClass('disabled'); }
      });

      $('[data-gift-immidiate] [data-immidiate-country]').on('change', () => {
        setTimeout(() => {
          new Shopify.CountryProvinceSelector('country', 'administrative_area_level_1', {
            hideElement: 'province-wrap',
          });
        }, 300);
      });
    },

    _initAutocomplete() {
      autocomplete = new google.maps.places.Autocomplete(
            (document.getElementById('street_number')), {
              types: ['geocode'],
            },
);

      autocomplete.addListener('place_changed', fillInAddress);

      function fillInAddress() {
        const place = autocomplete.getPlace();
        for (var component in componentForm) {
          document.getElementById(component).value = '';
          document.getElementById(component).disabled = false;
        }

        for (var i = 0; i < place.address_components.length; i++) {
          var streetAll;
          var addressType = place.address_components[i].types[0];
          if (componentForm[addressType]) {
            var val = place.address_components[i][componentForm[addressType]];
            $(`#${addressType}`).val(val);
            if (addressType == 'street_number') {
              streetAll = place.address_components[i][componentForm[addressType]];
            }
            if (addressType == 'route') {
              if (streetAll == undefined || streetAll == null || streetAll == '') {
                $('#street_number').val(place.address_components[i][componentForm[addressType]]);
              } else {
                $('#street_number').val(`${streetAll} ${place.address_components[i][componentForm[addressType]]}`);
              }
              $('#route').val('');
            }
          }
        }
        new Shopify.CountryProvinceSelector('country', 'administrative_area_level_1', {
          hideElement: 'province-wrap',
        });
        for (var i = 0; i < place.address_components.length; i++) {
          var addressType = place.address_components[i].types[0];
          if (place.address_components[i].types[0] == 'administrative_area_level_1') {
            var val = place.address_components[i][componentForm[addressType]];
            $(`#${addressType}`).val(val);
          }
        }
        for (var component in componentForm) {
          $(`#${component}`).each(function(e) {
            if ($.trim($(this).val()) == '') {
              $(this).closest('form').find('.select-btn-alter')
                .removeClass('button-fill');
            } else {
              const email_id = $('#add_email_add').val();
              if (filter.test(email_id) && $('#add_phone').val() != '' && $('#add_email_add').val() != '' && $('#add_first_name').val() != '' && $('#add_last_name').val() != '' && $('#street_number').val() != '' && $('#locality').val() != '' && $('#postal_code').val() != '' && $('#add_p_note').val() != '') {
                $(this).closest('form').find('.select-btn-alter')
                  .addClass('button-fill');
              }
            }
          });
        }
      }
    },

  },
};

export default subscriptionMethods;
