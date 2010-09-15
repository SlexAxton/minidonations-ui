// mdTextLimit Plugin
// by Alex Sexton
// AlexSexton@gmail.com
(function(global, doc, $){
  $.fn.mdTextLimit = function(options) {
    if (this.length) {
      var options = $.extend({}, {
        max: 10,
        hardlimit: true,
        html5: true,
        forceTruncate: true, // catchall
        errorClass: 'limitMet'
      }, options || {});
      
      return this.each(function(){
        var $this    = $(this),
            $global  = $(global),
            keyHandle;
        
        if (options.html5) {
          // Add the maxlength attribute, for supporting html5 browsers
          $this.attr('maxlength', options.max);
        }
        
        // Make sure it's not already over count
        if ($this.text().length > options.max) {
          $this.addClass(options.errorClass);
        }
        
        // Create the counting function
        keyHandle = function(e){
          var over = false,
              len  = $this.val().length;
          
          // Check if we're over
          if (len >= options.max) {
            if (len > options.max) {
              over = true;
            }
            
            // Add our class
            $this.addClass(options.errorClass);
          }
          else {
            $this.removeClass(options.errorClass);
          }
          
          // Make sure we want to hard limit
          if (over && options.hardlimit) {
            // For good measure, truncate
            if (options.forceTruncate) {
              $this.val($this.val().substr(0, options.max));
            }
            
            // Stop the event
            e.stopImmediatePropagation();
            return false;
          }
          
          // Trigger the event
          $this.trigger('lengthChange', [len]);
          
          // continue on
          return true;
        };
        
        // On a focus, bind to the key up event, and do a count
        $this.focus(function(){
         $global.bind('keyup', keyHandle);
        });
        
        // On a blur, unbind it
        $this.blur(function(){
          $global.unbind('keyup', keyHandle);
        });
      });
    }
    return this;
  };
})(this, this.document, this.jQuery);