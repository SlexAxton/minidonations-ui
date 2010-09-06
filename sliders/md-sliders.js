/*
  About: mdslider plugin
  
    This plugin is for distributing available percentages among
    and arbitrary amount of entities.
    
    There is a private <github repo at https://github.com/SlexAxton/minidonations-ui> or <e-mail me at alexsexton@gmail.com>
*/
(function(global, doc, $){
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
      
        The mdslider instance (for chaining).
    */
    init: function (options, elem) {
      
      return this;
    }
  };
  
  /*
    Namespace: Local Namespace
    
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
    
      The jQuery object for chaining capability.
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
})(this, this.document, this.jQuery);