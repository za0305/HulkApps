/**
 * Account page methods
 * -----------------------------------------------------------------------------
 *
 * @namespace account
 */

import password from 'password-strength-meter';

const accountMethods = {

  methods: {
    _initAccount() {
      if (app.currentTemplate !== 'account') {
        return;
      }

      app._initTab();

      $('[data-tablist] a[data-toggle="tab"]').on('shown.bs.tab', (e) => {
        e.target; // newly activated tab
        window.location.hash = $(e.target).attr('href');
      });

      const $accountTabs = $(app.selectors.accountTabs);
      const $loginForm = $(app.selectors.loginForm);
      const $recoverForm = $(app.selectors.recoverForm);
      const $passwordInput = $(app.selectors.passwordInput);
      const hash = window.location.hash;

      // account tabs => url hash
      hash && $accountTabs.find(`ul.nav a[href="${hash}"]`).tab('show');

      $accountTabs.find('.nav a').click(function(e) {
        window.location.hash = $(this).attr('href');
      });

      function showRecoverPasswordForm() {
        $recoverForm.fadeIn();
        $loginForm.hide();
        app.storeUtilities.loginHelper.isLoginFormVisible = false;
      }

      function hideRecoverPasswordForm() {
        $recoverForm.hide();
        $loginForm.fadeIn();
        app.storeUtilities.loginHelper.isLoginFormVisible = true;
      }

      // allow deep linking to the recover password form
      if (hash === '#recover') {
        $accountTabs.find('ul.nav a[href="#login"]').tab('show');
        showRecoverPasswordForm();
      }

      $(document).on('click', '[data-register-link]', () => {
        $accountTabs.find('ul.nav a[href="#register"]').tab('show');
      });

      $(document).on('click', '[data-recover-link]', () => {
        showRecoverPasswordForm();
      });

      $(document).on('click', '[data-cancel-recover-link]', () => {
        hideRecoverPasswordForm();
      });

      $(document).on('click', '[href="#subscriptions"]', () => {
        app._scrollTop();
        if ($('#modal-address.show').length > 0) {
          $('#modal-address .popup-close.close').click();
        }
      });
      // password strength meter
      $passwordInput.password({
        shortPass: 'The password is too short',
        badPass: 'Weak; try combining letters & numbers',
        goodPass: 'Medium; try using special characters',
        strongPass: 'Strong password',
        containsUsername: 'The password contains the username',
        enterPass: 'Type your password',
        showPercent: false,
        showText: true, // shows the text tips
        animate: true, // whether or not to animate the progress bar on input blur/focus
        animateSpeed: 'fast', // the above animation speed
        username: false, // select the username field (selector or jQuery instance) for better password checks
        usernamePartialMatch: false, // whether to check for username partials
        minimumLength: 6, // minimum password length (below this threshold, the score is 0)
      });

      // toggle collapse for edit address
      // show one card at a time
      $(document).on('click', '[data-edit-address]', function() {
        const target = $(this).data('target');
        $('.collapse').collapse('hide');
        $(target).collapse('show');

        $('html').animate({
          scrollTop: $(target).offset().top,
        }, 400);

        // unlock window - fix scrolltop common problem
        $(window).bind('mousewheel', () => {
          $('html').stop();
        });
      });

      app._initShopifyAccountMethods();
    },

    _initShopifyAccountMethods() {
      if ($('[data-account-address]').length === 0) {
        return;
      }

      const addressesIds = JSON.parse($('[data-account-json]').html()).addressesIds;
      if ($('[data-account-address]').length > 0 && $('#AddressCountryNew').length > 0) {
        new Shopify.CountryProvinceSelector('AddressCountryNew', 'AddressProvinceNew', {
          hideElement: 'AddressProvinceNew',
        });
      }

      addressesIds.forEach((id) => {
        if ($(`#AddressCountry_${id}`).length > 0) {
          new Shopify.CountryProvinceSelector(`AddressCountry_${id}`, `AddressProvince_${id}`, {
            hideElement: `AddressProvince_${id}`,
          });
        }
      });

      Shopify.CustomerAddress = {
        destroy(id, confirm_msg) {
          if (confirm(confirm_msg || 'Are you sure you wish to delete this address?')) {
            Shopify.postLink(`/account/addresses/${id}`, {
              parameters: {_method: 'delete'},
            });
          }
        },
      };
    },

    _initTab() {
      const hash = window.location.hash;
      switch (hash) {
        case '#subscriptions':
          $(`[data-tablist] a[href="${hash}"]`).addClass('active');
          $(`[data-tablist] a[href="${hash}"]`).attr('aria-selected', 'true');
          $(`[aria-labelledby="${$(`[data-tablist] a[href="${hash}"]`).attr('aria-controls')}"]`).addClass('active');
          break;
      }
    },

  },
};

export default accountMethods;
