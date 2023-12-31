/**
 * Shared state data
 * -----------------------------------------------------------------------------
 *
 * @namespace store
 */

const store = {
  // Elements via data attributes
  selectors: {
    sitePreloader: '[data-site-preloader]',
    productObj: '[data-product-json]',
    siteOverlay: '[data-site-overlay]',
    siteHeader: '[data-site-header]',
    headerSlider: '[data-header-slider]',
    searchLayer: '[data-search-layer]',
    newsletterPopup: '[data-newsletter-popup]',
    carousel: '[data-flickity]',
    productToolbarMobile: '[data-product-toolbar-mobile]',
    productTabs: '[data-product-tabs]',
    accountTabs: '[data-account-tabs]',
    singleOptionSelector: '[data-single-option-selector]',
    qtyContainer: '[data-qty-container]',
    qtyInput: '[data-qty-input]',
    cartItem: '[data-cart-item]',
    productForm: '[data-product-form]',
    cartForm: '[data-cart-form]',
    loginForm: '[data-login-form]',
    recoverForm: '[data-recover-form]',
    passwordInput: '[data-password-input]',
    imageZoom: '[data-img-zoom]',
  },
  // Global objects
  domain: window.theme.domain,
  currentTemplate: null,
  currentPageUrl: null,
  isLoading: false,
  hasSubscription: false,
  hasGiftSubscription: false,
  hasAddon: false,
  articleSortDesc: false,
  articleSortOpt: null,
  moneyFormat: window.theme.moneyFormat,
  colorSwatchesEnabled: window.theme.colorSwatchesEnabled,
  sizeSwatchesEnabled: window.theme.sizeSwatchesEnabled,
  productExcludeTag: window.theme.productExcludeTag,
  expandDesc: false,
  customer: window.theme.customer,
  addresses: JSON.parse(window.theme.addresses),
  cartLoading: false,
  cartEvent: null,
  soldout_plan: null,
  soldoutJr: window.theme.soldoutJr,
  soldoutAdult: window.theme.soldoutAdult,
  utmJr: window.theme.utmJr,
  utmAdult: window.theme.utmAdult,
  isUtmJr: false,
  isUtmAdult: false,
  loadVideo: false,
  loadInsta: false,

  // subscription integration
  subscriptionFlow: {
    isCurrentTab: false,
    isGiftSub: false,
    giftType: null,
    giftRenew: false,
    subscriptionPlan: {},
    subscriptionPlanJson: [],
    subscriptionPlans: [],
    subscriptionPayment: null,
    productAddon: [],
    subTotal: null,
    currentStep: null,
    addonType: null,
    selectedPlanType: null,
  },
  giftEmail: {
    isEmailValidate: false,
    emailValidateMsg: null,
    date: null,
    first_name: null,
    last_name: null,
    email: null,
    gEmail: null,
    rEmail: null,
    company: null,
    address1: null,
    address2: null,
    province: 'Alabama',
    country: 'United States',
    city: null,
    zip: null,
    phone: null,
    msg: null,
  },
  // ReCharge Integration
  reChargeDiscountVariantId: null,
  rechargeDashboard: {
    shopifyAPI: 'https://api.owlcrate.com/api/shopify/common',
    API: 'https://api.owlcrate.com/api/recharge/common',
    isCustomer: window.theme.customerLoggedIn,
    customersID: window.theme.customersID,
    customersFirstName: window.theme.customersFirstName,
    customersLastName: window.theme.customersLastName,
    customerEmail: window.theme.customerEmail,
    isgetsubscription: false,
    customerDetails: null,
    subscriptions: {},
    charges: {},
    skip_shippment: {},
    subscriptionplans: [],
    defaultPlans: [],
    activeSubscription: [],
    normalSubscription: [],
    unactiveSubscription: [],
    orderTransactions: [],
    addonsOrders: [],
    addresses: {},
    address: {},
    currentProduct: {},
    updatedProduct: {},
    currentSubscription: {},
    currentAddressSubscription: {},
    isSubscriptionCancelReason: false,
    isEditPayment: false,
    isCancelOption: false,
    monthlyCancelSub: false,
    isupdateAddress: false,
    isupdateAccount: false,
    isChangeAddress: false,
    isSkipShipment: false,
    prepaidSwitchCancelSub: false,
    isUpdateAddressModal: false,
    isChooseOpt: true,
    isSwitchPlan: false,
    isUpdateSubscription: false,
    isConfirmSubscriptionUpdate: false,
    pauseConfirmation: false,
    monthlyConfirmation: false,
    pauseSubscription: {},
    upcomingSub: {},
    isIFrameLoad: false,
    addressType: null,
    discount_code: 'OneMonth10',
    discountPause: window.theme.discountPause,
    discountSwitch: window.theme.discountSwitch,
  },
  claimGift: {
    claimGiftType: null,
    subscriptionGiftList: {},
    giftFound: false,
    rechargeGiftForm: {
      gEmailFName: null,
      gEmailLName: null,
      address1: null,
      address2: null,
      city: null,
      province: 'Alabama',
      zip: null,
      country: 'United States',
      phone: null,
    },
    submittedGift: false,
    giftClaimedSuccessfully: false,
    hasRechargeClaimPopup: false,
    currentGiftID: null,
  },
};

export default store;
