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
        if (localStorage.getItem('selected_plan') === 'null' && localStorage.getItem('selected_payment') === 'null') { window.location.href = 'https://shop.owlcrate.com/pages/subscribe'; }
      }

      if (app.currentTemplate !== 'subscription-plan') { localStorage.setItem('is_gift', 'false'); }

      if (app.currentTemplate === 'index') {
        if ($('[data-product-json]').length > 0) {
          app._initSubscriptionProduct();
          app.subscriptionFlow.subscriptionPlan.shipping_interval_unit_type = $(`[data-${app.subscriptionFlow.subscriptionPlan.handle}-frq-unit]`).text();
        } else { app.subscriptionFlow.subscriptionPlan = null; }
        localStorage.setItem('selected_payment', null);
        localStorage.setItem('is_gift', 'false');
        localStorage.setItem('current_step', 1);
      }

      if (app.currentTemplate !== 'subscription-plan' && app.currentTemplate !== 'box-subscription') { return; }
      // Intialize selected plan
      if (app.currentTemplate === 'box-subscription') {
        if ($('[data-product-json]').length > 0) {
          app._initSubscriptionProduct();
        } else {
          app.subscriptionFlow.subscriptionPlan = null;
        }
      } else {
        const selectedPlan = localStorage.getItem('selected_plan');
        app.subscriptionFlow.subscriptionPlan = JSON.parse(selectedPlan);
        app.subscriptionFlow.currentStep = localStorage.getItem('current_step');
        if (localStorage.getItem('selected_payment') && parseInt(app.subscriptionFlow.currentStep) === 3) { app._initSubscriptionPayment(); }
      }

      app.subscriptionFlow.isGiftSub = localStorage.getItem('is_gift');
      app.subscriptionFlow.addonType = app.subscriptionFlow.subscriptionPlan.tags.find((x) => x.includes('box_'));
      app.subscriptionFlow.subscriptionPlan.variantlength = app.subscriptionFlow.subscriptionPlan.variants.length;
      app.subscriptionFlow.subscriptionPlan.shipping_interval_unit_type = $(`[data-${app.subscriptionFlow.subscriptionPlan.handle}-frq-unit]`).text();
            // app.subscriptionFlow.subscriptionPlan.shipping_interval_frequency =  $('[data-'+app.subscriptionFlow.subscriptionPlan.handle+'-shipping_interval_frequency]').text();
      app.subscriptionFlow.subscriptionPlan.subscription_id = $(`[data-${app.subscriptionFlow.subscriptionPlan.handle}-subscription_id]`).text();
      app._addedCustomAttrInProduct();
      app._giftValidation();
      if ($(window).width() > 767 && parseInt(app.subscriptionFlow.currentStep) === 2) {
        setTimeout(() => {
          let cardText = 0;
          $('[data-plan-wrap]').each(function() {
            if ($(this).find('[data-card-total]').height() > cardText) { cardText = $(this).find('[data-card-total]').height(); }
          });
          $('[data-plan-wrap] [data-card-total]').height(cardText);
        }, 500);
      }

      $('[data-sub-json]').each((index, item) => {
        const productObj = $(item).html();
        const productData = JSON.parse(productObj);
        productData.variant.metafields = productData.metafields;
        app.subscriptionFlow.subscriptionPlans.push(productData.variant);
      });

    },

    // Initialize Sub. Product on Product Page
    _initSubscriptionProduct() {
      const productJson = JSON.parse($('[data-product-json]').html());
      localStorage.setItem('selected_plan', JSON.stringify(productJson.product));
      const selectedPlan = localStorage.getItem('selected_plan');
      app.subscriptionFlow.subscriptionPlan = JSON.parse(selectedPlan);
      localStorage.setItem('is_gift', 'false');
      localStorage.setItem('selected_payment', null);
      app._addedCustomAttrInProduct();
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

    // Choose product from navigation
    _chooseProductInMenu(handle, step, eventType) {
      if (handle == null) {
        localStorage.setItem('selected_plan', null);
        localStorage.setItem('selected_payment', null);
        localStorage.getItem('current_step', 1);
      } else {
        const productJson = JSON.parse($(`[data-nav-${handle}-json]`).html());
        localStorage.setItem('current_step', 2);
        localStorage.setItem('selected_plan', JSON.stringify(productJson));

        if (eventType === 'type-gift') {
          localStorage.setItem('is_gift', 'true');
        } else {
          localStorage.setItem('is_gift', 'false');
        }

        window.location.href = 'https://shop.owlcrate.com/pages/subscription-plan';
      }
    },

    _chooseProductOnPage(handle, step, eventType) {
      let productJson;
      if (app.currentTemplate === 'index') {
        productJson = JSON.parse($(`[data-inside-${handle}-json]`).html());
      } else {
        productJson = JSON.parse($(`[data-${handle}-json]`).html());
      }

      if (eventType === 'type-gift') {
        localStorage.setItem('is_gift', 'true');
      } else {
        localStorage.setItem('is_gift', 'false');
      }

      localStorage.setItem('current_step', 2);
      localStorage.setItem('selected_plan', JSON.stringify(productJson));
      window.location.href = 'https://shop.owlcrate.com/pages/subscription-plan';
    },

    // Choose gift product from Owlcrate subscription page
    _chooseGiftProductOnPage(handle, step, eventType) {
      localStorage.setItem('is_gift', true);
      localStorage.setItem('current_step', 2);
      if (eventType === 'type-gift') {
        localStorage.setItem('is_gift', 'true');
      } else {
        localStorage.setItem('is_gift', 'false');
      }
      setTimeout(() => {
        window.location.href = 'https://shop.owlcrate.com/pages/subscription-plan';
      }, 300);
    },

    _addedCustomAttrInProduct() {
      if (app.subscriptionFlow.subscriptionPlan.tags.length > 0) {
        if (app.subscriptionFlow.subscriptionPlan.tags.includes('box_adult')) {
          app.subscriptionFlow.subscriptionPlan.boxage = 'adult';
        } else if (app.subscriptionFlow.subscriptionPlan.tags.includes('box_junior')) {
          app.subscriptionFlow.subscriptionPlan.boxage = 'junior';
        } else {
          app.subscriptionFlow.subscriptionPlan.boxage = undefined;
        }
      }

      app.subscriptionFlow.subscriptionPlan.variants.forEach((variant, index) => {
        variant.charge_internal_frequency = $(`[data-${variant.id}-charge-frq-json]`).text();
        variant.shipping_interval_frequency = $(`[data-${variant.id}-shipping_interval_frequency]`).text();
        variant.plan_variant_id = parseInt($(`[data-${variant.id}-plan_variant_id]`).text());
        variant.is_hidden = $(`[data-${variant.id}-is_hidden]`).text();
        variant.save = parseInt((app.subscriptionFlow.subscriptionPlan.variants[0].price * variant.charge_internal_frequency) - variant.price);
      });
    },

    _selectedPlan(variant) {
      localStorage.setItem('selected_payment', JSON.stringify(variant));
      localStorage.setItem('current_step', 3);
      app.subscriptionFlow.subscriptionPayment = variant;
      setTimeout(() => {
        app._nextStage(2, 3);
      }, 100);
    },

    _selectedPagePlan(variant) {
      localStorage.setItem('selected_payment', JSON.stringify(variant));
      localStorage.setItem('current_step', 3);
      setTimeout(() => {
        window.location.href = 'https://shop.owlcrate.com/pages/subscription-plan';
      }, 100);
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
                    $.trim($('[data-gift-immidiate] [data-immidiate-country]').val()) !== '') {
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
            window.location.href = 'https://shop.owlcrate.com/pages/gift';
          } else {
            window.location.href = 'https://shop.owlcrate.com/pages/subscribe';
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
                $('#street_number').val(`${streetAll}, ${place.address_components[i][componentForm[addressType]]}`);
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
