/*
  About: The mdslider jQuery Plugin
  
    This plugin is for distributing available percentages among
    and arbitrary amount of entities.
    
    This plugin requires jQuery, jQuery UI, underscore.js and json2.js for unsupported browsers.
    
    by Alex Sexton
    
    There is a private <github repo at https://github.com/SlexAxton/minidonations-ui> or <e-mail me at alexsexton@gmail.com>
*/
(function(global, doc, $, _){
  /*
    Namespace: mdslider
    
      This is the namespace object for the slider instance. Create new instances of this for your
      actual ui elements.
  */
  var mdslider = {
    
    /*
      Function: init
      
        This is for object initialization, specifically tailored for
        jQuery plugin instantiation, but it's not strictly necessary.
      
      Parameters:
      
        options - The instance options from the available set. These override the defaults if they exist.
        elem    - The DOM element reference.
      
      Returns:
      
        Object - The mdslider instance (for chaining).
    */
    init: function (options, elem) {
      // Extend our default options
      this.options = $.extend({}, this.options, options);
      
      // Shortcut references
      var opts = this.options,
          that = this;
      
      /*
        Property: elem
        
          The related raw dom element that was connected to the slider object.
      */
      this.elem = elem;
      
      /*
        Property: $elem
        
          The related jQuery wrapped dom element cached for speed.
      */
      this.$elem = $(elem);
      
      /*
        Property: data
        
          The current set of slider data
      */
      
      // If we have init data, and it's a string
      if (opts.data && _(opts.data).isString()) {
        
        // Request the JSON at that URL
        $.getJSON(opts.data, function(data){
          // Override with the real data
          that.data = data;
          
          // Build the dom
          that.buildDom();
        });
        
      }
      // If we have a legit Array of slider definitions
      else if (opts.data && _(opts.data).isArray()) {
        // Deep copy to separate current from initial
        this.data = $.extend(true, {}, opts.data);
        
        // Use it to build the dom
        this.buildDom();
      }
      
      // Manage global change
      this.$elem.bind('change', function(ui, changedSlider){
        var total = that.getTotal(),
            $this = $(this);
        $this.find('.'+opts.totalClass).text((total || '0')+'%');
        
        // update remainingBar
        $this.find('.'+opts.remainingBarClass).each(function(){
          var $this = $(this);
          $this
            .width(that.getRemainingPixelWidth())
            .css({
              'left' : that.getRemainingPixelOffset($this.closest('.ui-slider').data(opts.namespace + 'sliderdata'))
            });
        });
        
        changedSlider.sliderElem.find('.'+opts.takenBarClass).width(changedSlider.value+'%');
      });
      
      // Return self, for chaining
      return this;
    },
    
    /*
      Property: options
      
        This is the default set of options for the sliders
    */
    options: {
      namespace      : "mdslider.",
      max            : 100,
      min            : 0,
      wrapperClass   : 'sliderwrapper',
      sliderPrefix   : 'slider-',
      wrapperPrefix  : 'sliderwrapper-',
      topBarClass    : 'mdsliderTopBar',
      headerClass    : 'sliderHeader',
      headerValClass : 'curVal',
      removeClass    : 'removeSlider',
      totalClass     : 'slidersTotal',
      remainingBarClass : 'remainingBar',
      remainingBarColor : '#009900',
      takenBarClass  : 'takenBar',
      takenBarColor  : '#0066FF',
      width          : 600,
      sliderDefaults : {
        "min"   : 0,
        "max"   : 100,
        "step"  : 1
      }
    },
    
    /*
      Function: buildDom
      
        This function takes whatever is in data and totally builds out the
        sliders from scratch. It will destroy anything inside of the element
        to begin with.
      
      Returns:
      
        Object - The mdslider object for chaining.
    */
    buildDom: function() {
      // Some local vars
      var data = this.data,
          opts = this.options,
          that = this;
      
      // Kill everything else
      this.$elem.empty();
      
      // Add the header
      this.$elem.append('<div class="'+opts.topBarClass+'">Total: <span class="'+opts.totalClass+'">'+this.getTotal()+'%</span></div>');
      
      // Go through each slider and create it
      _(data).each(function(sliderdata){
        // Append each slider to the container
        that.$elem.append(that.buildSliderDom(sliderdata));
      });
      
      return this;
    },
    
    /*
      Function: buildSliderDom
      
        This function is for building a single instance of a slider. It is
        to be used in conjunction with the buildDom feature, which may invoke it
        several times.
      
      Parameters:
      
        sliderdata - The object that defines the properties of the slider (id, name, value, etc.)
      
      See Also:
      
        <buildDom>
      
      Returns:
        DOMElement - The DOM element with all correct data attachments, etc.
    */
    buildSliderDom: function(sliderdata) {
      var opts = this.options,
          that = this;
      
      // Return the element, but set all of it's stuff first
      var sliderWrapper = $('<div />')
                // Set the id
                .attr('id', opts.wrapperPrefix+sliderdata.id)
                .addClass(opts.wrapperClass)
                .append('<div class="'+opts.headerClass+'">' + sliderdata.name +
                        ' - <span class="'+opts.headerValClass+'">'+(sliderdata.value || '0')+'%</span>'+
                        ' [<a class="'+opts.removeClass+'" href="#">x</a>]'+
                        '</div>'),
          
          sliderElem = $('<div />')
                // Save the slider data on it
                .data(opts.namespace + 'sliderdata', sliderdata)
                // Set the id
                .attr('id', opts.sliderPrefix+sliderdata.id)
                .width(opts.width)
                // Call the jQuery UI slider plugin on it
                .slider($.extend({}, opts.sliderDefaults, {
                  
                  // Set the value
                  value  : sliderdata.value,
                  
                  // Manage the ability to slide
                  slide  : function(event, ui) {
                    if (that.canSetSliderTo(sliderdata, ui.value)) {
                      // set the new value
                      sliderdata.value = ui.value;
                      // custom event for all slider change
                      that.$elem.trigger('change', [sliderdata]);
                      // update the ui
                      sliderWrapper.find('.'+opts.headerValClass).text(ui.value + '%');
                      return true;
                    }
                    // Force a total calculation
                    $(this).slider('value', that.canSetSliderTo(sliderdata));
                    // Stop sliding if it's not possible
                    return false;
                  },
                  
                  // Handle the change event
                  change : function(event, ui) {
                    // update the ui
                    sliderWrapper.find('.'+opts.headerValClass).text(ui.value + '%');
                    // set the new value
                    sliderdata.value = ui.value;
                    // custom event for all slider change
                    that.$elem.trigger('change', [sliderdata]);
                  }
                })),
      
      
      remainingBar = $('<div />')
                        .addClass(opts.remainingBarClass)
                        .width(this.getRemainingPixelWidth())
                        .height(10)
                        .html('&nbsp;') // ie6 hates empty divs :(
                        .css({
                          //'background-color': opts.remainingBarColor,
                          'position'        : 'absolute',
                          'margin-top'      : '2.5px',
                          'opacity'         : 0.7,
                          'left'            : that.getRemainingPixelOffset(sliderdata)
                        }),
      
      takenBar = $('<div />')
                        .addClass(opts.takenBarClass)
                        .width(sliderdata.value+'%')
                        .height(10)
                        .html('&nbsp;') // ie6 hates empty divs :(
                        .css({
                          //'background-color': opts.takenBarColor,
                          'position'        : 'absolute',
                          'margin-top'      : '2.5px',
                          'opacity'         : 0.7,
                          'left'            : 0
                        });
      
      
      
      // Save a reference back to the object
      sliderdata.sliderElem = sliderElem;
      
      // put the remaining bar in the slider
      sliderElem.append(takenBar).append(remainingBar);
      
      // Put the slider in the wrapper
      sliderWrapper.append(sliderElem);
      
      // Manage removal
      sliderWrapper.find('.'+opts.removeClass).click(function(){
        that.removeSlider(sliderdata.id);
        sliderdata.value = 0;
        that.$elem.trigger('change', [sliderdata]);
        return false;
      });
      
      // Return the dom element
      return sliderWrapper;
    },
    
    getRemainingPixelOffset: function(slider) {
      var opts = this.options;
      
      return slider.value+'%';
    },
    
    getRemainingPixelWidth: function(){
      var opts       = this.options;
      
      return Math.floor(opts.width*((opts.max-this.getTotal())/opts.max));
    },
    
    /*
      Function: getTotal
      
        Adds up the slider percentages and returns their sum
      
      Returns:
      
        Number - The sum of all percentages of sliders
    */
    getTotal: function() {
      var total = 0;
      
      // Go through each
      _(this.data).each(function(slider){
          total += slider.value;
      });
      
      this.percentAvailable = this.options.max - total;
      
      return total;
    },
    
    /*
      Function: canSetSliderTo
      
        Tests the ability to move a slider to a value
      
      Parameters:
      
        sliderdata - The sliderdata object (for to know which is being updated)
        newvalue   - The value that you are trying to test this to go to
      
      Returns:
      
        boolean | number - true if it is possible, false if it's not.
    */
    canSetSliderTo: function(sliderdata, newvalue) {
      var total = 0,
          opts  = this.options,
          retBool = (newvalue || newvalue === 0) ? true : false;
      
      // Go through each
      _(this.data).each(function(slider){
        // If it's the one we're modifying
        if (sliderdata.id === slider.id) {
          // Use our new value
          if (retBool) {
            total += newvalue;
          }
        }
        else {
          // Otherwise use our stored value
          total += slider.value;
        }
      });
      
      // Different return types based on input... eh it's ok cause it's sooo similar
      if (!retBool) {
        return opts.max - total;
      }
      
      // If we're below or equal to our max
      if (total <= opts.max && total >= opts.min) {
        // It's cool
        return true;
      }
      
      // It's not cool
      return false;
    },
    
    /*
      Function: addSlider
      
        This function is used when a new distribution point is added. It will add the slider
        to the UI and fit it into the restrictions.
      
      Parameters:
      
        sliderObj - The object containing the name and id of the slider instance.
      
      See Also:
      
        <removeSlider>
      
      Returns:
      
        Object - The mdslider instance for chaining.
    */
    addSlider: function(sliderObj) {
      // Add in the value
      sliderObj.value = 0;
      
      // Make sure our id is a number
      sliderObj.id = global.parseInt(sliderObj.id, 10);
      
      // Add the dom portion
      this.$elem.append(this.buildSliderDom(sliderObj));
      
      // Add it to the data array
      this.data.push(sliderObj);
      
      // Custom event this
      this.$elem.trigger('sliderAdd', [sliderObj]);
      
      // Chain me.
      return this;
    },
    
    /*
      Function: removeSlider
      
        This function removes the slider with the given ID from the UI and dataset
      
      Parameters:
      
        sliderId - The ID of the slider that is to be removed
      
      See Also:
      
        <addSlider>
      
      Returns:
      
        Object - The mdslider instance for chaining.
    */
    removeSlider: function(sliderId) {
      var sadSlider,
          opts = this.options;
      
      // Find the desired slider
      _(this.data).each(function(slider){
        if (slider.id === sliderId) {
          sadSlider = slider;
        }
      });
      
      // Remove it
      if (sadSlider){
        // Send the custom event
        this.$elem.trigger('sliderRemove', [sadSlider]);
        
        // Take it out of the dom
        this.$elem.find('#'+opts.wrapperPrefix+sliderId).remove();
        
        // Save the new state
        this.data = _(this.data).without(sadSlider);
      }
      
      // Chain
      return this;
    },
    
    /*
      Function: toJSON
      
        This is for exporting the data of current selections to a JSON string,
        usually for sending back to the serverside to save. Note: this requires
        the JSON.stringify method exists.
      
      Returns:
        String - Valid JSON that represents the current selections.
    */
    toJSON: function() {
      var output = [];
      
      // Just get the data we need (id and value)
      _(this.data).each(function(slider){
        // Push it onto the array
        output.push({
          id    : slider.id,
          value : slider.value
        });
      });
      
      return global.JSON.stringify(output);
    }
  };
  
  /*
    Namespace: Custom Events
    
      The following are custom events thrown on the object that was intialized with the mdslider plugin
  */
  
  /*
    Function: sliderAdd
    
      Thrown when a slider is added to the set.
    
    Usage:
    
      $('#slider-container').bind('sliderAdd', function(ev, slider){ alert(slider.name + '  was added!'); });
  */
  /*
    Function: sliderRemove
    
      Thrown when a slider is removed from the set.
    
    Usage:
    
      $('#slider-container').bind('sliderRemove', function(ev, slider){ alert(slider.name + '  was removed!'); });
  */
  /*
    Function: change
    
      Thrown when the total distribution is changed at all
    
    Usage:
    
      $('#slider-container').bind('change', function(ev, slider){ alert('we have a new distribution!'); });
  */
  
  /*
    Namespace: Global Namespace
    
      These are functions that run in the surrounding closure.
  */

  if (typeof Object.create !== 'function') {
    /*
      Function: Object.create
      
        An Object.create shim for browsers that don't have one. This only instantiates
        if the native Object.create function does not exist.
      
      Parameters:
      
        o - The object you want a new(ish) instance of.
      
      Returns:
      
        A new "instance" of the object that was passed in, but via
        prototypal inheritance, so there is no deep copy made, but overrides
        occur automagically.
    */
    Object.create = function (o) {
      function F() {}
      F.prototype = o;
      return new F();
    };
  }

  /*
    Function: $.fn.mdslider
    
      A jQuery plugin instance of the mdslider tool for percentage distribution
    
    Parameters:
    
      options - An object with the options for the plugin instance.
    
    Returns:
    
      this - The jQuery object for chaining capability.
  */
  $.fn.mdslider = function(options) {
    // Break early if there's no elements
    if (this.length) {
      // For chaining and multiple instantiation
      return this.each(function(){
        // Create a new instance
        var mymdslider = Object.create(mdslider);
        
        // Initialize the object - pass in the options and the element
        mymdslider.init(options, this);
        
        // Save a backwards reference on the element with the correct namespace
        $.data(this, (options.namespace || 'mdslider.') + 'slider', mymdslider);
      });
    }
    else {
      return this;
    }
  };
})(this, this.document, this.jQuery, this._);