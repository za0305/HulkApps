// Older browsers support
import 'babel-polyfill';
import 'es6-promise/auto';
import 'formdata-polyfill';
import 'url-polyfill';

// Theme SCSS files
import '../../styles/theme.scss';
import '../../styles/theme.scss.liquid';

// Vue.js core
import Vue from 'vue';

// Bootstrap Framework
import 'bootstrap';

// Bootstrap-Vue
// import BootstrapVue from 'bootstrap-vue' // imports all library
// for better performance you can import individual components
// import bPopover from 'bootstrap-vue/es/components/popover/popover';
import bPopover from 'bootstrap-vue';

// Local Storage
// import Storage from 'vue-web-storage';

// Spinners
// https://epic-spinners.epicmax.co/#/get-started
import 'epic-spinners/dist/lib/epic-spinners.min.css';
import {HollowDotsSpinner} from 'epic-spinners/dist/lib/epic-spinners.min.js';

// Other libraries
import Vue2TouchEvents from 'vue2-touch-events';
import Snotify from 'vue-snotify';
import VueMatchHeights from 'vue-match-heights';
// import VueInstagram from 'vue-instagram';


// Google Web font loader plugin
import WebFont from 'webfontloader';

// allow inline javascript code to be executed by using '<script2></script2>' tag
// import VueScript2 from 'vue-script2';

// Lazysizes plugin for lazyloading
import 'lazysizes';
import 'lazysizes/plugins/unveilhooks/ls.unveilhooks'; // bg images support extension
import 'lazysizes/plugins/bgset/ls.bgset'; // responsive bg images support extension
import 'lazysizes/plugins/parent-fit/ls.parent-fit'; // parent fit extension

// Store => common data objects
import Countdown from 'vuejs-countdown';
import store from '../store/store';
import { VueRecaptcha } from 'vue-recaptcha';
export default {
    components: { VueRecaptcha }
};

// mixins
import helperMethods from '../mixins/helpers';
import layoutMethods from '../mixins/layout';
import cartMethods from '../mixins/cart';
import collectionMethods from '../mixins/collection';
import productMethods from '../mixins/product';
import accountMethods from '../mixins/account';
// import quickShopMethods from '../mixins/quickShop';
// import wishlistMethods from '../mixins/wishlist';
//import recentlyViewedMethods from '../mixins/recentlyViewed';
// import productReviewsMethods from '../mixins/productReviews';
import sectionMethods from '../mixins/section';
import subscriptionMethods from '../mixins/subscription';
import storeUtilitiesMethods from '../mixins/storeUtilities';
import rechargeMethods from '../mixins/rechargeMethods';
import customMethods from '../mixins/custom';

let app;

// register components in Vue
// Vue.use(VueScript2);
// Vue.use(BootstrapVue);
Vue.use(Vue2TouchEvents);
Vue.use(VueMatchHeights);
// Vue.use(VueInstagram);

Vue.use(Snotify, {
  global: {
    preventDuplicates: true,
  },
  toast: {
    position: 'rightTop',
  },
});

var _rollbarConfig = {
    accessToken: "1fcfcb47f065429d82a62724b38cddd3",
    captureUncaught: true,
    captureUnhandledRejections: true,
    payload: {
        environment: "production"
    }
};
// Rollbar Snippet
!function(r){var e={};function o(n){if(e[n])return e[n].exports;var t=e[n]={i:n,l:!1,exports:{}};return r[n].call(t.exports,t,t.exports,o),t.l=!0,t.exports}o.m=r,o.c=e,o.d=function(r,e,n){o.o(r,e)||Object.defineProperty(r,e,{enumerable:!0,get:n})},o.r=function(r){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(r,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(r,"__esModule",{value:!0})},o.t=function(r,e){if(1&e&&(r=o(r)),8&e)return r;if(4&e&&"object"==typeof r&&r&&r.__esModule)return r;var n=Object.create(null);if(o.r(n),Object.defineProperty(n,"default",{enumerable:!0,value:r}),2&e&&"string"!=typeof r)for(var t in r)o.d(n,t,function(e){return r[e]}.bind(null,t));return n},o.n=function(r){var e=r&&r.__esModule?function(){return r.default}:function(){return r};return o.d(e,"a",e),e},o.o=function(r,e){return Object.prototype.hasOwnProperty.call(r,e)},o.p="",o(o.s=0)}([function(r,e,o){"use strict";var n=o(1),t=o(5);_rollbarConfig=_rollbarConfig||{},_rollbarConfig.rollbarJsUrl=_rollbarConfig.rollbarJsUrl||"https://cdn.rollbar.com/rollbarjs/refs/tags/v2.22.0/rollbar.min.js",_rollbarConfig.async=void 0===_rollbarConfig.async||_rollbarConfig.async;var a=n.setupShim(window,_rollbarConfig),l=t(_rollbarConfig);window.rollbar=n.Rollbar,a.loadFull(window,document,!_rollbarConfig.async,_rollbarConfig,l)},function(r,e,o){"use strict";var n=o(2),t=o(3);function a(r){return function(){try{return r.apply(this,arguments)}catch(r){try{console.error("[Rollbar]: Internal error",r)}catch(r){}}}}var l=0;function i(r,e){this.options=r,this._rollbarOldOnError=null;var o=l++;this.shimId=function(){return o},"undefined"!=typeof window&&window._rollbarShims&&(window._rollbarShims[o]={handler:e,messages:[]})}var s=o(4),d=function(r,e){return new i(r,e)},c=function(r){return new s(d,r)};function u(r){return a((function(){var e=this,o=Array.prototype.slice.call(arguments,0),n={shim:e,method:r,args:o,ts:new Date};window._rollbarShims[this.shimId()].messages.push(n)}))}i.prototype.loadFull=function(r,e,o,n,t){var l=!1,i=e.createElement("script"),s=e.getElementsByTagName("script")[0],d=s.parentNode;i.crossOrigin="",i.src=n.rollbarJsUrl,o||(i.async=!0),i.onload=i.onreadystatechange=a((function(){if(!(l||this.readyState&&"loaded"!==this.readyState&&"complete"!==this.readyState)){i.onload=i.onreadystatechange=null;try{d.removeChild(i)}catch(r){}l=!0,function(){var e;if(void 0===r._rollbarDidLoad){e=new Error("rollbar.js did not load");for(var o,n,a,l,i=0;o=r._rollbarShims[i++];)for(o=o.messages||[];n=o.shift();)for(a=n.args||[],i=0;i<a.length;++i)if("function"==typeof(l=a[i])){l(e);break}}"function"==typeof t&&t(e)}()}})),d.insertBefore(i,s)},i.prototype.wrap=function(r,e,o){try{var n;if(n="function"==typeof e?e:function(){return e||{}},"function"!=typeof r)return r;if(r._isWrap)return r;if(!r._rollbar_wrapped&&(r._rollbar_wrapped=function(){o&&"function"==typeof o&&o.apply(this,arguments);try{return r.apply(this,arguments)}catch(o){var e=o;throw e&&("string"==typeof e&&(e=new String(e)),e._rollbarContext=n()||{},e._rollbarContext._wrappedSource=r.toString(),window._rollbarWrappedError=e),e}},r._rollbar_wrapped._isWrap=!0,r.hasOwnProperty))for(var t in r)r.hasOwnProperty(t)&&(r._rollbar_wrapped[t]=r[t]);return r._rollbar_wrapped}catch(e){return r}};for(var p="log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleAnonymousErrors,handleUnhandledRejection,captureEvent,captureDomContentLoaded,captureLoad".split(","),f=0;f<p.length;++f)i.prototype[p[f]]=u(p[f]);r.exports={setupShim:function(r,e){if(r){var o=e.globalAlias||"Rollbar";if("object"==typeof r[o])return r[o];r._rollbarShims={},r._rollbarWrappedError=null;var l=new c(e);return a((function(){e.captureUncaught&&(l._rollbarOldOnError=r.onerror,n.captureUncaughtExceptions(r,l,!0),e.wrapGlobalEventHandlers&&t(r,l,!0)),e.captureUnhandledRejections&&n.captureUnhandledRejections(r,l,!0);var a=e.autoInstrument;return!1!==e.enabled&&(void 0===a||!0===a||"object"==typeof a&&a.network)&&r.addEventListener&&(r.addEventListener("load",l.captureLoad.bind(l)),r.addEventListener("DOMContentLoaded",l.captureDomContentLoaded.bind(l))),r[o]=l,l}))()}},Rollbar:c}},function(r,e,o){"use strict";function n(r,e,o,n){r._rollbarWrappedError&&(n[4]||(n[4]=r._rollbarWrappedError),n[5]||(n[5]=r._rollbarWrappedError._rollbarContext),r._rollbarWrappedError=null);var t=e.handleUncaughtException.apply(e,n);o&&o.apply(r,n),"anonymous"===t&&(e.anonymousErrorsPending+=1)}r.exports={captureUncaughtExceptions:function(r,e,o){if(r){var t;if("function"==typeof e._rollbarOldOnError)t=e._rollbarOldOnError;else if(r.onerror){for(t=r.onerror;t._rollbarOldOnError;)t=t._rollbarOldOnError;e._rollbarOldOnError=t}e.handleAnonymousErrors();var a=function(){var o=Array.prototype.slice.call(arguments,0);n(r,e,t,o)};o&&(a._rollbarOldOnError=t),r.onerror=a}},captureUnhandledRejections:function(r,e,o){if(r){"function"==typeof r._rollbarURH&&r._rollbarURH.belongsToShim&&r.removeEventListener("unhandledrejection",r._rollbarURH);var n=function(r){var o,n,t;try{o=r.reason}catch(r){o=void 0}try{n=r.promise}catch(r){n="[unhandledrejection] error getting `promise` from event"}try{t=r.detail,!o&&t&&(o=t.reason,n=t.promise)}catch(r){}o||(o="[unhandledrejection] error getting `reason` from event"),e&&e.handleUnhandledRejection&&e.handleUnhandledRejection(o,n)};n.belongsToShim=o,r._rollbarURH=n,r.addEventListener("unhandledrejection",n)}}}},function(r,e,o){"use strict";function n(r,e,o){if(e.hasOwnProperty&&e.hasOwnProperty("addEventListener")){for(var n=e.addEventListener;n._rollbarOldAdd&&n.belongsToShim;)n=n._rollbarOldAdd;var t=function(e,o,t){n.call(this,e,r.wrap(o),t)};t._rollbarOldAdd=n,t.belongsToShim=o,e.addEventListener=t;for(var a=e.removeEventListener;a._rollbarOldRemove&&a.belongsToShim;)a=a._rollbarOldRemove;var l=function(r,e,o){a.call(this,r,e&&e._rollbar_wrapped||e,o)};l._rollbarOldRemove=a,l.belongsToShim=o,e.removeEventListener=l}}r.exports=function(r,e,o){if(r){var t,a,l="EventTarget,Window,Node,ApplicationCache,AudioTrackList,ChannelMergerNode,CryptoOperation,EventSource,FileReader,HTMLUnknownElement,IDBDatabase,IDBRequest,IDBTransaction,KeyOperation,MediaController,MessagePort,ModalWindow,Notification,SVGElementInstance,Screen,TextTrack,TextTrackCue,TextTrackList,WebSocket,WebSocketWorker,Worker,XMLHttpRequest,XMLHttpRequestEventTarget,XMLHttpRequestUpload".split(",");for(t=0;t<l.length;++t)r[a=l[t]]&&r[a].prototype&&n(e,r[a].prototype,o)}}},function(r,e,o){"use strict";function n(r,e){this.impl=r(e,this),this.options=e,function(r){for(var e=function(r){return function(){var e=Array.prototype.slice.call(arguments,0);if(this.impl[r])return this.impl[r].apply(this.impl,e)}},o="log,debug,info,warn,warning,error,critical,global,configure,handleUncaughtException,handleAnonymousErrors,handleUnhandledRejection,_createItem,wrap,loadFull,shimId,captureEvent,captureDomContentLoaded,captureLoad".split(","),n=0;n<o.length;n++)r[o[n]]=e(o[n])}(n.prototype)}n.prototype._swapAndProcessMessages=function(r,e){var o,n,t;for(this.impl=r(this.options);o=e.shift();)n=o.method,t=o.args,this[n]&&"function"==typeof this[n]&&("captureDomContentLoaded"===n||"captureLoad"===n?this[n].apply(this,[t[0],o.ts]):this[n].apply(this,t));return this},r.exports=n},function(r,e,o){"use strict";r.exports=function(r){return function(e){if(!e&&!window._rollbarInitialized){for(var o,n,t=(r=r||{}).globalAlias||"Rollbar",a=window.rollbar,l=function(r){return new a(r)},i=0;o=window._rollbarShims[i++];)n||(n=o.handler),o.handler._swapAndProcessMessages(l,o.messages);window[t]=n,window._rollbarInitialized=!0}}}}]);
// End Rollbar Snippet

// Vue.use(Storage, {
//   drivers: ['session', 'local'], // default 'local'
// });


// Create new Vue instance
new Vue({
  el: '#app',
  delimiters: ['${', '}'],

  components: {
    bPopover,
    HollowDotsSpinner,
    Countdown,
    VueRecaptcha,
  },

  mixins: [
    helperMethods,
    layoutMethods,
    cartMethods,
    collectionMethods,
    productMethods,
    accountMethods,
    // quickShopMethods,
    // wishlistMethods,
    // recentlyViewedMethods,
    // productReviewsMethods,
    sectionMethods,
    subscriptionMethods,
    storeUtilitiesMethods,
    rechargeMethods,
    customMethods,
  ],

  data() {
    return store; // shared data
  },

  beforeCreate() {
    $('.shopify-challenge__container').detach().appendTo('[data-app-scripts]');
   /* if ($('.shopify-challenge__container').length > 0) {
      $('.shopify-challenge__container').detach().appendTo('#app .inner-container');
      $('#app .inner-container').addClass('d-flex align-items-center justify-content-center').css('min-height', '60vh');
    } */
    $('head script[src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"]').remove();
    $('[data-topbar-style]').detach().appendTo('head');
    $('#app style').detach().appendTo('[data-app-scripts]');
    $('#app script').detach().appendTo('[data-app-scripts]');
    $('head link[href="https://ifa.cirkleinc.com/static/assets/css/stylenew.css"]').remove();
    // $('#additional-checkout-buttons iframe').addClass('d-none').detach().appendTo('[data-app-scripts]');
  },

  mounted() {
    app = this;
    window.app = app;
    window.slate = window.slate || {};
    window.theme = window.theme || {};

    // $(window).on('load', app._initTheme);

    app._getCurrentTemplate();
    app._initLayout(); // various functions related to layout, e.g. initialize Bootstrap specific components etc
    app._initSection(); // Shopify admin sections & blocks => interaction between theme JavaScript and the theme editor
    app._initCart(); // everything cart related, e.g. add product to cart etc
    if (app.currentTemplate === 'collection') {
      app._initCollection(); // everything related to the collection pages, e.g. collection filtering etc
    }
    if (app.currentTemplate === 'product') {
      app._initProduct(); // everything related to the product page, e.g. variant selection, product options, galleries etc
    }

    $(document).ready(() => {
      app._initTheme();
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = '//www.klaviyo.com/media/js/public/klaviyo_subscribe.js';
      document.getElementsByTagName('body')[0].appendChild(script);
      $('head script[src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"]').remove();

      if ($('head link[href="https://ifa.cirkleinc.com/static/assets/css/stylenew.css"]').length > 0) {
        $('head link[href="https://ifa.cirkleinc.com/static/assets/css/stylenew.css"]').remove();
      }
    });
  },

  methods: {
    onVerify() {
       // $('[type="submit"]').fadeIn();
       // $('.recaptcha-wrapper').fadeOut();
    },

    _initTheme() {
      // call helper function 
      // initialization methods
      app._loadFonts(); // laod fonts asynchronously via Webfont loader

      if (app.currentTemplate === 'account') {
        app._initAccount(); // everything related to the user account page, login, register etc
      }
      // app._initWishlist(); // wishlist functionality
      // app._initRecentlyViewed(); // recently viewed products functionality
      // app._initProductReviews(); // product reviews functionality
      app._initSubscribeMethods(); // Subscription flow js
      app._initStoreUtilities(); // methods for the store utilities app
      app._initCustomMethods(); // custom JS code
      // recharge get customer subscription call
      if (app.rechargeDashboard.customerEmail != null && app.currentTemplate === 'account') { app._initRecharge(); }

      if ($('head link[href="https://ifa.cirkleinc.com/static/assets/css/stylenew.css"]').length > 0) {
        $('head link[href="https://ifa.cirkleinc.com/static/assets/css/stylenew.css"]').remove();
      }

      // hide preloader
      setTimeout(() => {
        $(app.selectors.sitePreloader).addClass('is-hidden');
      }, 300);
    },

    // info how to load fonts => https://github.com/typekit/webfontloader
    _loadFonts() {
      WebFont.load({
        google: {
          families: [
            // 'Just Another Hand:400',
            'Barlow:400,400i,500,500i,600,600i',
            'Bad Script:400',
            'Muli:300,300i,400,400i,600,600i,700,700i',
            'Chelsea Market:400',
            'Grandstander:100,300,400,700',
          ],
        },
      });
    },
  },
});