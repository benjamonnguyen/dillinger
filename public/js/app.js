'use strict';

// Set up ace/brace before anything else
var ace = require('brace');
require('brace/mode/markdown');
window.ace = ace;  // Make ace globally available

(function (window, document) {
  var angular

  // jQuery
  window.jQuery = require('jquery'),
  require('jquery-ui-bundle/jquery-ui.js'),
  require('inverseresize/alsoResizeReverse/alsoResizeInverse')

  // AngularJS
  angular = require('exports-loader?angular!angular')

  // Angular Bootstrap UI
  require('angular-bootstrap')

  // Base
  require('./base/base.controller')
  require('./components/document-title.directive')
  require('./components/toggle-menu.directive')
  require('./components/toggle-settings.directive')
  require('./components/toggle-preview.directive')
  require('./components/switch.directive')
  require('./components/preview.directive')
  require('./components/focus.factory')

  require('./components/wtfisdillinger-modal.controller')
  require('./services/debounce.service')

  // User
  require('./user/user.controller')
  require('./services/user.service')

  // Documents
  require('./factorys/sheet.factory')
  require('./services/documents.service')
  require('./documents/documents-export.controller')
  require('./documents/documents.controller')
  require('./documents/delete-modal.controller')
  require('./services/wordscount.service')

  // Notifications
  require('./services/notification.service')

  // Zen Mode
  require('./zen-mode/zen-mode.controller')
  require('./zen-mode/zen-mode-toggle.directive')

  // File import.
  require('./file-import/drop-target.directive')
  require('./file-import/choose-file.directive')
  require('./file-import/import-file.controller')

  // Configure Dependencies
  angular.module('Dillinger', [
    'diBase',
    'diDocuments',
    'diNotify',
    'diUser',
    'diZenMode',
    'diFileImport',
    'ui.bootstrap',
    'diDebounce.service'
  ])

  // Run!
  angular.bootstrap(document, ['Dillinger'])
})(window, document)
