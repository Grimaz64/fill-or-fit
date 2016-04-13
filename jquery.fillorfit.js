/*!
 * jQuery Fill Or Fit Plugin v2.0
 * AUTHOR: Clément Caillard
 *
 * Bang bang bang !
 */

(function($, window, undefined){

    'use strict';

    function Fillorfit(element, options, callback){

        var options = $.extend({
            parent:          $(element).parent(),
            ratio:           16/9, // when not image, specify ratio
            method:          'fill', // fill/fit
            verticalAlign:   'center',//top/bottom/center
            horizontalAlign: 'center', //left/right/center
            ofParentHeight:  100, //% of parent Height
            ofParentWidth:   100, //% of parent Width
            deltaHeight:     0,
            deltaWidth:      0,
            maxWidth:        null, // px || 'initial'
            maxHeight:       null, // px || 'initial'
            afterResize:     function(){}
        }, options || {});

        this.$element        = $(element);
        this.$parent         = options.parent;
        this.ratio           = options.ratio;
        this.parentWidth     = null;
        this.parentHeight    = null;
        this.resizeMethod    = options.method;
        this.ofParentHeight  = options.ofParentHeight;
        this.ofParentWidth   = options.ofParentWidth;
        this.verticalAlign   = options.verticalAlign;
        this.horizontalAlign = options.horizontalAlign;
        this.deltaWidth      = options.deltaWidth;
        this.deltaHeight     = options.deltaHeight;
        this.maxWidth        = options.maxWidth;
        this.maxHeight       = options.maxHeight;
        this.afterResize     = (typeof options.afterResize === 'function') ? options.afterResize : function(){};

        this.callback        = (typeof callback === 'function') ? callback : function(){};

        this.isImg           = this.$element.is('img');

        if (this.isImg) {
            this.loadImage(this.$element.attr('src'), this.setInitSize);
        } else {
            this.maxWidth = (this.maxWidth === 'initial') ? null : this.maxWidth;
            this.maxHeight = (this.maxHeight === 'initial') ? null : this.maxHeight;
            this.addListeners();
        }
    }

    Fillorfit.prototype = {

        loadImage:  function(src, callback) {
            var self = this;

            var img = new Image();
            img.onerror = function() {
                this.onload = null;
                this.onerror = null;
                callback.call(self, img);
            };
            img.onload = function() {
                this.onload = null;  // Remove listener to save memory
                this.onerror = null; // Remove listener to save memory
                callback.call(self, img);
            };
            img.src = src;
        },

        setInitSize: function(img) {
            this.ratio = img.width / img.height;
            this.maxWidth = (this.maxWidth === 'initial') ? img.width : this.maxWidth;
            this.maxHeight = (this.maxHeight === 'initial') ? img.height : this.maxHeight;
            this.addListeners();
        },

        addListeners: function() {
            var self = this;

            $(window).on('resize.fillorfit orientationchange.fillorfit', function(){ self.adjustSize(); });
            this.adjustSize();
            this.callback.call(this);
        },

        adjustSize: function() {

            this.parentWidth  = ((this.$parent.outerWidth() / 100) * this.ofParentWidth) - this.deltaWidth;
            this.parentHeight = ((this.$parent.outerHeight() / 100) * this.ofParentHeight) - this.deltaHeight;

            if (this.maxWidth && this.parentWidth > this.maxWidth) {
                this.parentWidth = this.maxWidth;
            }
            if (this.maxHeight && this.parentHeight > this.maxHeight) {
                this.parentHeight = this.maxHeight;
            }

            var switcher = (this.resizeMethod == "fill") ? (this.parentWidth / this.ratio > this.parentHeight) : (this.parentWidth / this.ratio < this.parentHeight);

            var width      = Math.ceil((switcher) ? this.parentWidth : this.parentHeight * this.ratio);
            var height     = Math.ceil((switcher) ? this.parentWidth / this.ratio : this.parentHeight);
            var top        = "50%";
            var right      = "auto";
            var bottom     = "auto";
            var left       = "50%";
            var marginTop  = - height / 2;
            var marginLeft = - width / 2;

            if (this.verticalAlign == "top") {
                top = 0;
                marginTop = 0;
            } else if (this.verticalAlign == "bottom") {
				top = "auto";
				bottom = 0;
				marginTop = 0;
			}

            if (this.horizontalAlign == "left") {
                left = 0;
                marginLeft = 0;
            } else if (this.horizontalAlign == "right") {
                left = "auto";
                right = 0;
                marginLeft = 0;
			}

            this.$element.css({
                width: width,
                height: height,
                top: top,
                right: right,
                bottom: bottom,
                left: left,
                marginTop: marginTop,
                marginLeft: marginLeft,
                position: 'absolute'
            });

            this.afterResize.call(this);
        }
    };

    $.fn.fillorfit = function(options, callback) {
        return this.each(function(index) {
            var $self = $(this);
            if($self.data('Fillorfit')) return;
            var instance = new Fillorfit(this, options, callback);
            $self.data('Fillorfit', instance);
        });
    };
})(jQuery, window);
