/*
  About: The mdslider jQuery Plugin
  
    This plugin is for distributing available percentages among
    and arbitrary amount of entities.
    
    This plugin requires jQuery, jQuery UI, underscore.js and json2.js for unsupported browsers.
    
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
          that = this;
      
      // Kill everything else
      this.$elem.empty();
      
      // Go through each slider and create it
      _(data).each(function(sliderdata){
        // Append each slider to the container
        that.$elem.append(that.buildSliderDom(sliderdata));
      });
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
      return $('<div />')
                // Save the slider data on it
                .data(opts.namespace + 'sliderdata', sliderdata)
                // Set the id
                .attr('id', 'slider-'+sliderdata.id)
                // Call the jQuery UI slider plugin on it
                .slider($.extend({}, opts.sliderDefaults, {
                  
                  // Set the value
                  value  : sliderdata.value,
                  
                  // Manage the ability to slide
                  slide  : function(event, ui) {
                    // Stop sliding if it's not possible
                    return that.canSetSliderTo(sliderdata, ui.value);
                  },
                  
                  // Handle the change event
                  change : function(event, ui) {
                    // Set the new value
                    sliderdata.value = ui.value;
                  }
                }));
    },
    
    /*
      Function: canSetSliderTo
      
        Tests the ability to move a slider to a value
      
      Parameters:
      
        sliderdata - The sliderdata object (for to know which is being updated)
        newvalue   - The value that you are trying to test this to go to
      
      Returns:
      
        boolean - true if it is possible, false if it's not.
    */
    canSetSliderTo: function(sliderdata, newvalue) {
      var total = 0,
          opts  = this.options;
      
      // Go through each
      _(this.data).each(function(slider){
        // If it's the one we're modifying
        if (sliderdata.id === slider.id) {
          // Use our new value
          total += newvalue;
        }
        else {
          // Otherwise use our stored value
          total += slider.value;
        }
      });
      
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
      var sadSlider;
      
      // Find the desired slider
      _(this.data).each(function(slider){
        if (slider.id === sliderId) {
          sadSlider = slider;
        }
      });
      
      // Remove it
      if (sadSlider){
        this.data = _(this.data).without(sadSlider);
      }
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