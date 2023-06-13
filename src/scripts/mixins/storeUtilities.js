/**
 * Store Utilities Methods
 * -----------------------------------------------------------------------------
 *
 * @namespace storeUtilities
 */

import axios from 'axios';
import Flickity from 'flickity';

const storeUtilitiesMethods = {
  data() {
    return {
      shop: {},
      recentCartItem: null,
      storeUtilities: {
        ready: false,
        loginHelper: {
          settings: {},
          status: null,
          message: null,
          customerEmail: null,
          isLoginFormVisible: true,
          isCaptchaVerified: false,
          isEmailEntered: false,
        },
        productAddons: {
          settings: {},
          products: [],
          currentProductEnabled: false,
          totalValue: null,
        },
        relatedProducts: {
          settings: {},
          products: [],
          currentProductEnabled: false,
        },
        cartUpsells: {
          settings: {},
          products: [],
        },
        cartPromos: {
          settings: {},
          products: [],
          enablerCodes: [],
          inCartTotalValue: 0,
        },
      },
    };
  },

  methods: {
    async _initStoreUtilities() {
      app.storeUtilities.ready = false;
      if (!window.theme.utilitiesAppEnabled) {
        app.storeUtilities.ready = true;
        return;
      }

      const shopData = await app._getShopData();

      if (!shopData) {
        app.storeUtilities.ready = true;
      }
    },

    async _getShopData() {
      try {
        let shopData;
        let shopSettings;

        // shopData = app.$sessionStorage.get('shopData');
        shopData = JSON.parse(localStorage.getItem('shopData'));

        if (!shopData) {
          shopData = await axios.get('/apps/store-utilities-proxy/getShopData');
          app.shop = shopData.data.shop;
          shopSettings = shopData.data.settings.data;
          // pass to session storage to reduce server calls
          // app.$sessionStorage.set('shopData', shopData.data);
          localStorage.setItem('shopData', JSON.stringify(shopData.data));
        } else {
          app.shop = shopData.shop;
          shopSettings = shopData.settings.data;
        }

        app.storeUtilities.loginHelper.settings = shopSettings.loginHelper;
        app.storeUtilities.productAddons.settings = shopSettings.productAddons;
        app.storeUtilities.relatedProducts.settings = shopSettings.relatedProducts;
        app.storeUtilities.cartPromos.settings = shopSettings.cartPromos;
        app.storeUtilities.cartUpsells.settings = shopSettings.cartUpsells;
        app.storeUtilities.ready = true;

        // app._initCartUpsells();

        // switch (app.currentTemplate) {
        //   case 'product':
        //     app._initProductAddons();
        //     app._initRelatedProducts();
        //     break;
        //   // case 'cart':
        //   //   app._initCartPromos();
        //   //   break;
        //   // case 'account':
        //     // app._initLoginHelper();
        //     // break;
        //   default:
        //     // default action
        // }
      } catch (error) {
        app.storeUtilities.ready = true;
        // console.log(Object.keys(error), error.message);
      }
    },

    _initLoginHelper() {
      if (!app.storeUtilities.loginHelper.settings.enabled) {
        return;
      }

      // let tempCustomerEmail = app.$sessionStorage.get('customer_temp_email');
      let tempCustomerEmail = localStorage.getItem('customer_temp_email');
      if (tempCustomerEmail === 'null') { tempCustomerEmail = null; }

      app.storeUtilities.loginHelper.customerEmail = tempCustomerEmail;
      // Submit the form if the email field is not empty
      setTimeout(() => {
        if (app.storeUtilities.loginHelper.customerEmail !== null && app.storeUtilities.loginHelper.customerEmail.length > 0) {
          $('.shopify-warning').hide();
          app._submitLoginHelperForm();
        }
      }, 500);
    },

    async _submitLoginForm(event) {
        app.storeUtilities.loginHelper.isEmailEntered = true;
    },

    async _submitLoginHelperForm() {
      const formEl = $('#customer_login')[0];
      const formData = new FormData(formEl);
      // const customerEmail = formData.get('customer[email]');
      const customerEmail = encodeURIComponent(formData.get('customer[email]'));
      const customerPassword = formData.get('customer[password]');
      // app.$sessionStorage.set('customer_temp_email', encodeURI(formData.get('customer[email]')));
      localStorage.setItem('customer_temp_email',encodeURI(formData.get('customer[email]')));

      if (!customerEmail) {
        $('#customerEmail').addClass('is-invalid');
        return;
      }

      $('#customerEmail').removeClass('is-invalid');

      app.isLoading = true;
      const customerData = await axios.get(`/apps/store-utilities-proxy/getCustomerData?customer_email=${customerEmail}`);
      app.isLoading = false;
      app.storeUtilities.loginHelper.status = customerData.data.status;
      app.storeUtilities.loginHelper.message = customerData.data.message;
      // console.log(customerData.data.status);
      
      if (customerPassword) {
       // if (app.storeUtilities.loginHelper.isCaptchaVerified) {
            formEl.submit();
       // }
      } else {
        $('#customerPassword').addClass('is-invalid');
      }
    },

  },
};

export default storeUtilitiesMethods;
