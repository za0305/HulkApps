/**
 * Custom methods
 * -----------------------------------------------------------------------------
 *
 * @namespace custom
 */

// detect if a device is mouseOnly, touchOnly, or hybrid => http://detect-it.rafrex.com/
import detectIt from 'detect-it';
import Flickity from 'flickity';
// import Countdown from 'vuejs-countdown'

const customMethods = {

  data() {
    return {
      // your data here
      isDeliveryOptionOpen: false,
    };
  },

  methods: {
    _initCustomMethods() {
      // custom JS code

      $('head script[src="//ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"]').remove();

      app._setCampaingCode();

      const headerBox = $('header').outerHeight();
      $('.cart-sticky').css('top', `calc(${headerBox}px + 15px)`);
      if (matchMedia('screen and (min-width: 992px)').matches) {
        $('.filter-sticky').css('top', `calc(${headerBox}px + 10px)`);
      }

      const myElement = document.getElementsByClassName('feature-owlcrate');
      const elementWatcher = scrollMonitor.create(myElement);

      elementWatcher.enterViewport(() => {
        $('.features-item').addClass('active');
      });
      elementWatcher.exitViewport(() => {
        $('.features-item').addClass('active');
      });

      const images = document.querySelectorAll('.owlfeet-default');
      const elements = images;
      $.each(elements, (index, element) => {
        const elementWatcher = scrollMonitor.create(element);
        elementWatcher.enterViewport(function() {
          $(this.watchItem).addClass('active');
        });
        // elementWatcher.exitViewport(function() {
        //   $(this.watchItem).removeClass('active');
        // });
      });

      if (app.currentTemplate === 'blog') {
        const pageUrl = app.currentPageUrl.split('/blogs/');
        if (app.currentPageUrl.includes('?sort=article_descending')) {
          const pageUrlNew = `/blogs/${pageUrl[1]}`;
          app.articleSortOpt = $(`[data-article-sort] option[value="${pageUrlNew}"]`).val();
        } else if (app.currentPageUrl.includes('/tagged')) {
          const pageUrlNew = `/blogs/${pageUrl[1]}`;
          app.articleSortOpt = $(`[data-article-sort] option[value="${pageUrlNew}"]`).val();
        } else {
          const pageUrlNew = `/blogs/${pageUrl[1]}`;
          app.articleSortOpt = $(`[data-article-sort] option[value="${pageUrlNew}"]`).val();
        }
      }

      if (app.currentPageUrl.includes('?sort=article_descending')) { app.articleSortDesc = true; }

      if (app.currentTemplate === 'collection') {
        if (app.collection.activeFilters.length > 0) {
          $('[data-filter-content]').each(function() {
            if ($(this).find('[data-filter-ui] .active').length > 0) {
              // $(this).find('[data-filter-btn]').trigger('click');
              $(this).find('[data-filter-btn][data-filter-type="tag"]').removeClass('collapsed');
              $(this).find('[data-filter-btn][data-filter-type="tag"]').attr('aria-expanded', true);
              $(this).find('[data-collapse-content]').addClass('show');
            }
          });
        }
      }

      if (app.currentTemplate === 'subscribe-page' || app.currentTemplate === 'product') { localStorage.setItem('current_step', 1); }

      if (app.currentTemplate === 'subscribe-page') {
        localStorage.setItem('selected_payment', null);
        localStorage.setItem('selected_plan', null);
      }

      if (matchMedia('screen and (max-width: 767px)').matches && $('body').hasClass('template-page')) {
        const $carousel1 = $('[data-past-box]');
        const options1 = {
          cellAlign: 'center',
          wrapAround: true,
        };
        if (matchMedia('screen and (min-width: 768px)').matches) {
          options1.cellAlign = 'left';
          options1.wrapAround = false;
        }
        //const flkty01 = new Flickity($carousel1[0], options1);
      }

      // setTimeout(()=>{
      //   $('.flatpickr-input.input').on('click',function(){
      //     if($(this).hasClass('active') == true){
      //       $(this).removeClass('active');
      //       $('.flatpickr-calendar').removeClass('open');
      //     }
      //     else{
      //       $(this).addClass('active');
      //       $('.flatpickr-calendar').addClass('open');
      //     }
      //   });
      // },500)

      $(window).resize(() => {
        if ($(window).width() > 1024) {
          $('.mobile-nav-drawer').removeClass('opened');
          if (app.isMobileNavDrawerOpen) {
            app._toggleMobileNavDrawer();
          }
        }
      });

      setTimeout(() => {
        KlaviyoSubscribe.attachToForms('#klaviyo_adult', {
          hide_form_on_success: false,
          extra_properties: {
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $source: '$embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_type: 'Klaviyo Form',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_id: 'embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $consent_version: 'Embed default text',
          },
        });
        KlaviyoSubscribe.attachToForms('#klaviyo_jr', {
          hide_form_on_success: false,
          extra_properties: {
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $source: '$embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_type: 'Klaviyo Form',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_id: 'embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $consent_version: 'Embed default text',
          },
        });

        KlaviyoSubscribe.attachToForms('#klaviyo_footer_form', {
          hide_form_on_success: false,
          extra_properties: {
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $source: '$embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_type: 'Klaviyo Form',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_id: 'embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $consent_version: 'Embed default text',
          },
        });

        KlaviyoSubscribe.attachToForms('#klaviyo_sidebar_form', {
          hide_form_on_success: false,
          extra_properties: {
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $source: '$embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_type: 'Klaviyo Form',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_id: 'embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $consent_version: 'Embed default text',
          },
        });

        KlaviyoSubscribe.attachToForms('#klaviyo_footer_jr', {
          hide_form_on_success: false,
          extra_properties: {
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $source: '$embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_type: 'Klaviyo Form',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_id: 'embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $consent_version: 'Embed default text',
          },
        });
        KlaviyoSubscribe.attachToForms('#klaviyo_sidebar_jr', {
          hide_form_on_success: false,
          extra_properties: {
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $source: '$embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_type: 'Klaviyo Form',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_id: 'embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $consent_version: 'Embed default text',
          },
        });

        KlaviyoSubscribe.attachToForms('#klaviyo_form_jr', {
          hide_form_on_success: false,
          extra_properties: {
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $source: '$embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_type: 'Klaviyo Form',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $method_id: 'embed',
            // eslint-disable-next-line shopify/jquery-dollar-sign-reference
            $consent_version: 'Embed default text',
          },
        });
      }, 1500);

      $('#payment-form').on('load', function() {
        app.rechargeDashboard.isIFrameLoad = true;
        $(this).closest('[data-recharge-payment-form]').removeClass('opacity-iframe');
      });

      if ($('.jr-choose-your-plan ').length > 0 && $('#choose-plan').length > 0) {
        setTimeout(() => {
              var flkty = new Flickity( '#choose-plan', {
                contain: true,
                wrapAround: false,
                freeScroll: false,
                groupCells: "100%",
                dragThreshold: 20,
                lazyLoad: false,
                cellAlign: "center",
                prevNextButtons: true,
                pageDots: false,
                arrowShape: {"x0": 10, "x1": 60, "y1": 50, "x2": 65, "y2": 40, "x3": 25}
              });
        }, 1000);
      }

      // redirect then referral link not working
      if(document.location.pathname.includes('/refer/') && theme.template == "404" ){
        document.location.href = `https://${theme.domain}`
      }

    },

    _submitNewsletter(event) {
      if ($('#both_opt, #both_opt-1').is(':checked') == true) {
        const email = $(event.currentTarget).closest('form').find('#k_id_email').val();
        $('[data-klaviyo-footer-jr] #k_jr_id_email').val(email);
        $('[data-klaviyo-footer-jr] [data-submit] ').trigger('click');
      }
      if ($('#both_opt-1').is(':checked') == true) {
        const email = $(event.currentTarget).closest('form').find('#k_id_email-1').val();
        $('[data-klaviyo-footer-jr-1] #k_jr_id_email-1').val(email);
        $('[data-klaviyo-footer-jr-1] [data-submit] ').trigger('click');
      }
    },

    _selectNewsletter(eventType, listID, removeId) {
      $('[data-klaviyo-footer-form]').removeClass(`klaviyo_gdpr_embed_${removeId}`);
      $('[data-klaviyo-footer-form]').addClass(`klaviyo_gdpr_embed_${listID}`);
      $('[data-klaviyo-footer-form] [data-input-hidden]').val(listID);
    },

    _isExpandBox(event) {
      $(event.currentTarget).parents('[data-delivery-option]').removeClass('before-open')
        .addClass('opened')
        .removeClass('after-open');
      $(event.currentTarget).parents('[data-delivery-option]').siblings('[data-delivery-option]')
        .removeClass('opened')
        .addClass('before-open')
        .addClass('after-open');
    },

    _sortArticle(getSortOpt) {
      window.location.href = getSortOpt;
    },

    _validateEmail(sEmail) {
      const filter = /^([\w-\.]+)@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.)|(([\w-]+\.)+))([a-zA-Z]{2,4}|[0-9]{1,3})(\]?)$/;
      if (filter.test(sEmail)) {
        return true;
      } else {
        return false;
      }
    },

    _changeIndexTab(eventType) {
      if (eventType === 'plan_jr') {
        app.subscriptionFlow.isCurrentTab = true;
        $('[data-plan-type="plan_jr"]').removeClass('d-none');
        $('[data-plan-type="plan_adult"]').addClass('d-none');
      } else {
        app.subscriptionFlow.isCurrentTab = false;
        $('[data-plan-type="plan_jr"]').addClass('d-none');
        $('[data-plan-type="plan_adult"]').removeClass('d-none');
      }
    },

    _toggleBill(event, eventType) {
      const el = $(event.currentTarget).attr('href');
      if (eventType === 'account') {
        $('#account-tab').removeClass('active');
        $('a[href="#account-tab"]').removeClass('active').attr('aria-selected', false);
        $(el).addClass('active');
      } else {
        window.location.href = `/account${el}`;
      }
    },

    _changeTab() {
      $('[data-subscriptions-tab]').trigger('click');
      $('html, body').animate({
        scrollTop: 0,
      }, 600);
      let cardTitle = 0;
      $('[data-addons-wrap] [data-card]').each(function() {
        if ($(this).find('[data-card-title]').height() > cardTitle) { cardTitle = $(this).find('[data-card-title]').height(); }
      });
      $('[data-addons-wrap] [data-card] [data-card-title]').height(cardTitle);
    },

    _soldoutProduct(planProd, eventType) {
      app.soldout_plan = planProd;
      if (eventType == 'account') {
        $('#modal-subscription').modal('hide');
        setTimeout(() => {
          $('[data-soldout-modal]').modal({
            keyboard: false,
          });
        }, 100);
      } else {
        $('[data-soldout-modal]').modal({
          keyboard: false,
        });
      }
    },

    _closeTopbar() {
      $(app.selectors.siteHeader).find('.desktop-logo').css('margin-top', '0')
        .addClass('my-2');
      const $siteHeader = $(app.selectors.siteHeader);
      const $topBar = $siteHeader.find('[data-top-bar]');
      let navHeight;
      if ($topBar.length > 0) {
        navHeight = $siteHeader.outerHeight() - $topBar.outerHeight();
      }
      $('body #app').css('padding-top', navHeight);
      $(app.selectors.siteHeader).find('[data-top-bar]').removeClass('d-block')
        .addClass('d-none');
    },

    _setCampaingCode() {
      let href = window.location.href;
      const isUtmJr = app._getCookie('isUtmJr');
      const isUtmAdult = app._getCookie('isUtmAdult');

      if (isUtmJr != 'isUtmJr' || isUtmAdult != 'isUtmAdult') {
        app._getCampaingCode();
      } else if (href.includes('utm_source')) {

        href = href.split('?');

        const d = new Date();
        d.setTime(d.getTime() + (24 * 60 * 60 * 1000));
        const expires = `expires=${d.toGMTString()}`;
        const utmCode = href[1].split('=');
        // utmCode.forEach((x) => {
          // const data = x.split('=');
        // console.log('tes', utmCode[0]);
        if (utmCode[0] == 'utm_source') {
          if (app.utmJr != null && app.utmJr == utmCode[1]) {
            document.cookie = `isUtmJr=${utmCode[1]};${expires};path=/`;
            document.cookie = `isUtmAdult=null;${expires};path=/`;
          } else if (app.utmAdult != null && app.utmAdult == utmCode[1]) {
            document.cookie = `isUtmAdult=${utmCode[1]};${expires};path=/`;
            document.cookie = `isUtmJr=null;${expires};path=/`;
          }
          app._getCampaingCode();
        }
        // });
      }
    },

    _getCampaingCode() {
      const utm_jr_source = app._getCookie('isUtmJr');
      const utm_adult_source = app._getCookie('isUtmAdult');
      if (app.utmJr != null && app.utmJr == utm_jr_source) {
        app.isUtmJr = true;
      } else if (app.utmAdult != null && app.utmAdult == utm_adult_source) {
        app.isUtmAdult = true;
      }
    },

  },

};

export default customMethods;
