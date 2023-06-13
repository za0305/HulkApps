/**
 * Layout related methods
 * -----------------------------------------------------------------------------
 *
 * @namespace layout
 */

import enquire from 'enquire.js';
import detectIt from 'detect-it';
import tinycolor from 'tinycolor2';
import Flickity from 'flickity';
import videojs from 'video.js';
import 'videojs-youtube/dist/Youtube.min.js';
import 'video.js/dist/video-js.min.css';

let videoPlayer = null;

const layoutMethods = {

  data() {
    return {
      scrollPosition: 0,
      isLogoLight: false,
      isOverlayVisible: false,
      isCartDrawerOpen: false,
      isMobileNavDrawerOpen: false,
      isFilterNavDrawerOpen: false,
      isSearchLayerOpen: false,
      isNewsletterPopupOpen: false,
      isSizeGuidePopupOpen: false,
    };
  },

  methods: {
    _initLayout() {
      window.addEventListener('scroll', app._checkScrollPos); // add scroll event listener
      window.addEventListener('resize', app._initStickyHeader); // add resize event listener

      // make all images in RTE editor load via lazyload
      $('.rte img').addClass('lazyload');

      app._initBootstrapComponents();
      app._initNewsletterPopup();
      app._initStickyHeader();
      app._initCarousels();
      app._checkScrollPos();
      app._checkCurrencyElements();

      setTimeout(() => {
        app.loadInsta = true;
      }, 2500);

      // init videos
      // if ($('.video-js').length > 0) {
      //   videojs(document.querySelector('.video-js'));
      // }
    },

    _playvideo() {
      app.loadVideo = true;
      setTimeout(() => {
        const videoPlayerSlid = videojs(document.querySelector('.video-js'));
        $('[data-index-video] [data-wrap] [data-img], [data-index-video] [data-wrap] span').addClass('d-none');
        $('[data-index-video] [data-wrap] .video-js').removeClass('d-none');
        setTimeout(() => {
          videoPlayerSlid.play();
        }, 700);
      }, 100);
    },

    _initBootstrapComponents() { /* Bootstrap components that need to be initialized should be called here */
      // init popover
      $('[data-toggle="popover"]').popover();

      // cart dropdown popover
      $('[data-cart-dropdown]').popover({
        html: true,
        content() {
          return $(this).next('[data-cart-dropdown-content]').html();
        },
      });

      // init tooltip but only for desktop
      if (!detectIt.hasTouch) {
        setTimeout(() => {
          $('[data-toggle="tooltip"]').tooltip();
        }, 100);
      }

      // make navigation drop-downs open on mouse hover instead of click
      $('.navbar a[data-toggle="dropdown"]').on('mouseenter', function(e) {
        const $dropdownLink = $(this).parent();
        const $dropdownMenu = $dropdownLink.find('.dropdown-menu');

        $dropdownLink.addClass('show');
        $dropdownMenu.addClass('show');

        $dropdownLink.on('mouseleave', function(e) {
          $(this).removeClass('show');
          $dropdownMenu.removeClass('show');
        });
      });

      // make also the top link clickable
      $('.navbar a[data-toggle="dropdown"]').on('click', function(e) {
        location.href = $(this).attr('data-href');
      });
    },

    _initNewsletterPopup() {
      const customerPosted = (window.location.href.search('[?&]customer_posted=true') !== -1);
      const $newsletterPopup = $(app.selectors.newsletterPopup);
      const popupDelay = $newsletterPopup.data('popup-delay') * 1000;
      const daysUntil = $newsletterPopup.data('period-until');
      const newsletterPopupEnabled = $newsletterPopup.data('newsletter-enabled');
      const newsletterPopupStatus = app._getCookie('newsletter_popup_status');
      const today = new Date();
      const expirationDate = new Date();
      expirationDate.setDate(today.getDate() + daysUntil);
      const time = expirationDate.getTime();
      const expireTime = time + 1000 * 36000;
      expirationDate.setTime(expireTime);

      // after registration get the 'customer_posted' parameter from URL
      // show popup after successful registration
      // the popup will have the 'Thank you' message after registration redirection
      if (customerPosted) {
        app._toggleNewsletterPopup();
      }

      // do not show the popup if the disabled status cookie exists
      if (newsletterPopupStatus === 'disabled' || !newsletterPopupEnabled) {
        return;
      }

      setTimeout(() => {
        app._toggleNewsletterPopup();
      }, popupDelay);

      $(document).on('click', '[data-newsletter-close-btn]', () => {
        document.cookie = `newsletter_popup_status=disabled;expires=${expirationDate.toGMTString()};path=/`;
      });
    },

    _initStickyHeader() {
      const $siteHeader = $(app.selectors.siteHeader);
      const $headerSlider = $(app.selectors.headerSlider);
      const $mainNav = $siteHeader.find('nav');
      const $topBar = $siteHeader.find('[data-top-bar]');
      let navHeight;

      if ($topBar.length > 0) {
        navHeight = $mainNav.outerHeight() + $topBar.outerHeight();
      } else {
        navHeight = $mainNav.outerHeight();
      }

      if ($siteHeader.data('fixed-header')) { // boolean
       // $('body #app').css('padding-top', navHeight);
      } else {
       // $headerSlider.css('height', $headerSlider.outerHeight() - navHeight);
      }
    },

    /**
     * Window scroll info => update classes & elements
     */
    _checkScrollPos() {
      const $siteHeader = $(app.selectors.siteHeader);
      const $mainNav = $siteHeader.find('nav');
      const $topBar = $siteHeader.find('[data-top-bar]');
      const $navBgColor = $mainNav.css('backgroundColor');
      const isHeaderTransparent = $siteHeader.data('transparent-header');
      const isHomepage = $('body').hasClass('template-index');
      const $bookBlock = $('.vh__wrapper');
      const $subscriptionBar = $('.subscription-bar');
      const windowScrollY = window.scrollY;
      let isDarkBg;
      let navHeight;

      if ($topBar.length > 0) {
        navHeight = $mainNav.outerHeight() + $topBar.outerHeight();
      } else {
        navHeight = $mainNav.outerHeight();
      }

      if (app.scrollPosition < windowScrollY && app.scrollPosition > navHeight) {
        // direction down
        //$('body').removeClass('is-scrolled-top is-scrolled-up').addClass('is-scrolled-down');
        //isDarkBg = tinycolor($navBgColor).isDark(); // returns boolean

        /*if (isDarkBg) {
          app.isLogoLight = true;
        } else {
          app.isLogoLight = false;
        }*/
      } else {
        // direction up
        //$('body').removeClass('is-scrolled-top is-scrolled-down').addClass('is-scrolled-up');
        /*if (isHomepage && isHeaderTransparent) {
          $mainNav.removeClass('bg-transparent');
        }
        isDarkBg = tinycolor($navBgColor).isDark(); // returns boolean

        if (isDarkBg) {
          app.isLogoLight = false;
        } */
      }

      if (windowScrollY <= navHeight) {
        // reached top
        //$('body').removeClass('is-scrolled-up').addClass('is-scrolled-top');

       /* if (isHomepage && isHeaderTransparent) {
          $mainNav.addClass('bg-transparent');
          app.isLogoLight = true;
        } */
      }

      // hide popover past to 200
      // if (app.scrollPosition > 200){
      //   app.$root.$emit('bv::hide::popover')
      // }

      //app.scrollPosition = windowScrollY;

      // Fan made of books
      if(isHomepage && $bookBlock.length > 0) {
        if (windowScrollY >= $bookBlock.offset().top - 500) {
          $bookBlock.addClass('focus');
        } else {
          $bookBlock.removeClass('focus');
        }
      }

      // Fixed Header
      if (windowScrollY >= 190) {
        $('body').addClass('fixed-header');
      } else {
        $('body').removeClass('fixed-header');
      }

      // Subscription bar + Fixed Header
      if (windowScrollY > app.scrollPosition){
        // downscroll code
        if (windowScrollY >= 600) {
          $subscriptionBar.addClass('active');
        }
      } else {
        // upscroll code
        $subscriptionBar.removeClass('active');
      }
      app.scrollPosition = windowScrollY;
    },

    _initCarousels() {
      const $carousel = $(app.selectors.carousel);
      let videoPlayerSlider;

      if ($carousel.length > 0) {
        const flkty = Flickity.data($carousel[0]); // pass in the element, $element[0], not the jQuery object

        if (typeof flkty === 'undefined') {
          return;
        }

        const totalSlides = flkty.cells.length;
        let selectedSlide = flkty.selectedElement;
        let slideType = $(selectedSlide).data('slide-type');

        if (totalSlides <= 1) {
          $carousel.addClass('hide-nav-ui');
        }

        flkty.on('settle', () => {
          selectedSlide = flkty.selectedElement;
          slideType = $(selectedSlide).data('slide-type');

          if (slideType === 'video') {
            videoPlayerSlider = videojs($(selectedSlide).find('.video-js')[0]);
            videoPlayerSlider.play();
          }
        });

        flkty.on('change', (index) => {
          if (videoPlayerSlider) {
            videoPlayerSlider.pause();
          }
        });

        flkty.resize();
        app._triggerResize();
      }
    },

    _initVideo(selectedSlide) {
      const $selectedVideo = $(selectedSlide).find('[data-video-slide]');
      const selectedVideoId = $selectedVideo.data('video-id');

      if (!selectedVideoId) {
        return;
      }

      function onPlayerReady(e) {
        e.target.setPlaybackQuality('hd720');
        e.target.mute();
        e.target.playVideo();
      }

      function onPlayerStateChange(e) {
        if (e.data === YT.PlayerState.ENDED) {
          // console.log('video finished');
        }
      }

      enquire.register('screen and (min-width: 720px)', {
        match() {
          YouTubeIframeLoader.load((YT) => {
            videoPlayer = new YT.Player($selectedVideo[0], {
              videoId: selectedVideoId,
              width: '100%',
              height: '100%',
              playerVars: {
                enablejsapi: 1,
                autoplay: 1,
                loop: 1,
                playlist: selectedVideoId, // otherwise loop will not work
                rel: 0,
                controls: 0,
                showinfo: 0,
                modestbranding: 0,
                disablekb: 1,
                // 'start': 0,
                // 'end': 335,
              },
              events: {
                onReady: onPlayerReady,
                onStateChange: onPlayerStateChange,
              },
            });
          });
        },
        unmatch() {
          if (videoPlayer) {
            videoPlayer.destroy();
          }
        },
      });
    },

    /**
     * Event when variant quantity selector changes
     */
    _updateQty(event) {
      const $qtyEl = $(event.currentTarget).parentsUntil(app.selectors.qtyContainer).find(app.selectors.qtyInput);
      let qtyValue = $qtyEl.val();
      const $item = $(event.currentTarget).closest(app.selectors.cartItem);
      const variantId = $item.data('variant-id');
      const cartProduct = app.cart.items.find((x) => x.variant_id === variantId);
      const productCartLimit = $item.data('cart-limit');

      if ($(event.currentTarget).data('qty-decrease') !== undefined) {
        if (parseFloat(qtyValue) >= 2) {
          qtyValue = parseFloat(qtyValue) - 1;
        }
      } else if ($(event.currentTarget).data('qty-increase') !== undefined) {
        qtyValue = parseFloat(qtyValue) + 1;

        // check if item has product limit assigned
        if (app.currentTemplate === 'cart' && app._productHasCartLimit(qtyValue, productCartLimit)) {
          return;
        }
      }

      $qtyEl.val(qtyValue);
    },

    /**
     * Event for toggling the cart drawer
     *
     */
    _toggleCartDrawer() {
      if (app.currentTemplate === 'cart') {
        return;
      }

      const $siteOverlay = $(app.selectors.siteOverlay);
      const cartType = $(app.selectors.siteHeader).data('cart-type');

      // stop parsing if cart type is not set to 'drawer'
      if (cartType !== 'cart_drawer' && cartType === 'cart_page') {
        window.location.href = '/cart';
        return;
      }

      if (!app.isCartDrawerOpen) { // open drawer
        app.isOverlayVisible = true;
        app._lockScroll();

        // re-init tooltips but only for desktop
        if (!detectIt.hasTouch) {
          $('[data-toggle="tooltip"]').tooltip();
        }
      } else {
        app.isOverlayVisible = false;
        app._unlockScroll();
      }

      // toggle the status data
      app.isCartDrawerOpen = !app.isCartDrawerOpen;

      $siteOverlay.on('click', () => {
        if (app.isSearchLayerOpen) {
          return;
        }
        app._toggleCartDrawer();
      });

      $(document).on('keydown', (e) => { // close drawer
        if (!app.isCartDrawerOpen) {
          return;
        }
        e = e || window.event;
        if (e.keyCode === 27) {
          app._toggleCartDrawer();
        }
      });
    },

    /**
     * Event for toggling the mobile menu drawer
     *
     */
    _toggleMobileNavDrawer() {  console.log('_toggleMobileNavDrawer');
      const $siteOverlay = $(app.selectors.siteOverlay);

      if (!app.isMobileNavDrawerOpen) { // open drawer
       // app.isOverlayVisible = true;
        app._lockScroll();
        app.isSearchLayerOpen = false;
        app.isFilterNavDrawerOpen = false;
        $('.search-reveal,[data-site-overlay]').css('top', 0);
        $('.site-header').removeClass('active');
        $('body').addClass('mobile-menu-opened');
      } else {
        app.isOverlayVisible = false;
        app._unlockScroll();
        $('body').removeClass('mobile-menu-opened');
      }

      // toggle the status data
      app.isMobileNavDrawerOpen = !app.isMobileNavDrawerOpen;

      $siteOverlay.on('click', () => {
        if (!app.isMobileNavDrawerOpen) {
          return;
        }
        app._toggleMobileNavDrawer();
      });
    },

    _toggleFilterNavDrawer() {
      const $siteOverlay = $(app.selectors.siteOverlay);

      if (!app.isFilterNavDrawerOpen) { // open drawer
        app.isOverlayVisible = true;
        app._lockScroll();
        $('.search-reveal,[data-site-overlay]').css('top', 0);
        $('.site-header').removeClass('active');
      } else {
        app.isOverlayVisible = false;
        app._unlockScroll();
      }

      // toggle the status data
      app.isFilterNavDrawerOpen = !app.isFilterNavDrawerOpen;

      $siteOverlay.on('click', () => {
        if (!app.isFilterNavDrawerOpen) {
          return;
        }
        app._toggleFilterNavDrawer();
      });
    },

    /**
     * Event for toggling the search layer
     *
     */
    _toggleSearch() { console.log('_toggleSearch');
      const headerBox = $('.site-header').outerHeight();
      const $siteOverlay = $(app.selectors.siteOverlay);
      const $searchLayer = $(app.selectors.searchLayer);
      const searchType = $searchLayer.data('search-type');
      const $inputSearch = $searchLayer.find('#searchInput');

      if (!app.isSearchLayerOpen) {
        $inputSearch.val('');
        app._lockScroll();

        $('.search-reveal,[data-site-overlay]').css('top', headerBox);
        $('.site-header').addClass('active');
        $('.mobile-nav-drawer').addClass('search-opened');

        if (searchType === 'full_screen') {
          $('header, footer, section').addClass('filter-blur').css('opacity', '0.5');
          $('[data-product-toolbar-mobile]').hide();
        } else {
          app.isOverlayVisible = true;
        }

        setTimeout(() => {
          $inputSearch.focus();
        }, 500);
      } else {
        $inputSearch.blur();
        app._unlockScroll();
        $('.search-reveal,[data-site-overlay]').css('top', 0);
        $('.site-header').removeClass('active');
        $('.mobile-nav-drawer').removeClass('search-opened');

        if (searchType === 'full_screen') {
          $('header, footer, section').removeClass('filter-blur').css('opacity', '1');
          $('[data-product-toolbar-mobile]').show();
        } else {
          app.isOverlayVisible = false;
        }
      }

      // toggle the status data
      app.isSearchLayerOpen = !app.isSearchLayerOpen;

      $(document).on('keydown', (e) => { // close drawer
        if (!app.isSearchLayerOpen) {
          return;
        }
        e = e || window.event;
        if (e.keyCode === 27 && app.isSearchLayerOpen) {
          app._toggleSearch();
        }
      });

      // overlay on click to close search
      $siteOverlay.on('click', () => {
        if (!app.isSearchLayerOpen) {
          return;
        }
        app._toggleSearch();
      });

    },

    /**
     * Event for toggling the newsletter popup
     *
     */
    _toggleNewsletterPopup() {
      if (!app.isNewsletterPopupOpen) {
        app._lockScroll();
        app.isOverlayVisible = true;
      } else {
        app._unlockScroll();
        app.isOverlayVisible = false;
      }

      // toggle the status data
      app.isNewsletterPopupOpen = !app.isNewsletterPopupOpen;
    },

    /**
     * Lock window scroll
     *
     */
    _lockScroll() {
      $('html').addClass('body-hidden');

      $(document).on('touchmove', (e) => {
        if (!$(e.target).closest('[data-touch-moveable]').length) {
          e.preventDefault();
        }
      });
    },

    /**
     * Unlock window scroll
     *
     */
    _unlockScroll() {
      $('html').removeClass('body-hidden');
      $(document).unbind('touchmove');
    },

    _changeCurrency() {
      const $currencyForm = $('[data-currency-selector]');
      $currencyForm[0].submit();
    },

    /**
     * Recharge Integration => Attach Recharge widget dynamically
     */
    _attachRechargeWidget(productId) {
      // recharge widget
      const $subscriptionWidget = $(`[data-recharge-subscription-widget="${productId}"]`);
      const $rcContainer = $(`#recurring_choice_${productId}`);

      if ($rcContainer.length > 0) {
        $subscriptionWidget.find('.inner').append($rcContainer);
        $subscriptionWidget.show();
        $rcContainer.show();
      }
    },

    /**
     * Recharge Integration => Detach Recharge widget dynamically
     */
    _detachRechargeWidget(productId) {
      // recharge widget
      const $subscriptionWidget = $(`[data-recharge-subscription-widget="${productId}"]`);
      const $rcContainer = $(`#recurring_choice_${productId}`);
      const $ghostPlaceholder = $('[data-recharge-ghost-placeholder]');

      if ($rcContainer.length > 0) {
        // reset recharge widget form to first options
        $('[data-input-one-time]').trigger('click');
        $subscriptionWidget.find('select').prop('selectedIndex', 0);
        // remove subscription properties
        $('[name="properties[subscription_id]"]').remove();
        // put back
        $ghostPlaceholder.append($rcContainer);
        $subscriptionWidget.find('.inner').empty();
        $subscriptionWidget.hide();
        $rcContainer.hide();
      }
    },

    // OPEN/CLOSE SIZE GUIDE POPUP
    _toggleSizeGuidePopup() {
      if (!app.isSizeGuidePopupOpen) {
        app._lockScroll();
        app.isOverlayVisible = true;
      } else {
        app._unlockScroll();
        app.isOverlayVisible = false;
      }

      app.isSizeGuidePopupOpen = !app.isSizeGuidePopupOpen;
    },
    // TOGGLE SIZE GUIDE TABS
    _changeSizeGuideTab(name) {
      if (!name){
        return;
      }
      document.querySelectorAll('.size_guide_table').forEach(item=>{
        item.classList.remove('active');
      });
      document.querySelectorAll('.size_guide_nav_item').forEach(item=>{
        item.classList.remove('active');
      });
      document.querySelector('.size_guide_table_' + name).classList.add('active');
      document.querySelector('.size_guide_nav_item.' + name).classList.add('active');
    },

  },
};

export default layoutMethods;
