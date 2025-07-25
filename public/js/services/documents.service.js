'use strict'

import angular from "angular"

/**
 *    Documents Service.
 */

/**
* @typedef {Object} Document
* @property {string} title
* @property {string} body
* @property {string} path
*/

/**
 * @typedef {Object} Metadata
 * @property {string} hash
 * @property {int} lastUpdatedOn
 */

export default
  angular
    .module('diDocuments.service', ['diDocuments.sheet'])
    .factory('documentsService', function ($rootScope, $http, Sheet, diNotify) {
      var service = {
        currentDocument: {},
        files: [],
        getItem: getItem,
        getItemByIndex: getItemByIndex,
        getItemById: getItemById,
        addItem: addItem,
        removeItem: removeItem,
        createItem: createItem,
        size: size,
        getItems: getItems,
        removeItems: removeItems,
        importFile: importFile,
        setCurrentDocument: setCurrentDocument,
        getCurrentDocument: getCurrentDocument,
        setCurrentDocumentTitle: setCurrentDocumentTitle,
        getCurrentDocumentTitle: getCurrentDocumentTitle,
        setCurrentDocumentBody: setCurrentDocumentBody,
        getCurrentDocumentBody: getCurrentDocumentBody,
        setCurrentCursorValue: setCurrentCursorValue,
        save: save,
        init: init
      }

      service.init()

      return service

      /// ///////////////////////////

      /**
     *    Get item from the files array.
     *
     *    @param  {Object}  item  The actual item.
     */
      function getItem (item) {
        return service.files[service.files.indexOf(item)]
      }

      /**
     *    Get item from the files array by index.
     *
     *    @param  {Integer}  index  The index number.
     */
      function getItemByIndex (index) {
        return service.files[index]
      }

      /**
     *    Get item from the files array by it's id.
     *
     *    @param  {Integer}  id  The id of the file (which is actually
     *                           Date().getTime())
     */
      function getItemById (id) {
        var tmp = null

        angular.forEach(service.files, function (file) {
          if (file.id === id) {
            tmp = file
            return false
          }
        })

        return tmp
      }

      /**
     *    Add item to the files array.
     *
     *    @param  {Object}  item  The item to add.
     */
      function addItem (item) {
        return service.files.push(item)
      }

      /**
     *    Remove item from the files array.
     *
     *    @param  {Object}  item  The item to remove.
     */
      function removeItem (item) {
        return service.files.splice(service.files.indexOf(item), 1)
      }

      /**
     *    Creates a new document item.
     *
     *    @param  {Object}  props  Item properties (`title`, `body`, `id`).
     */
      function createItem (props) {
        return new Sheet(props)
      }

      /**
     *    Get the files array length.
     */
      function size () {
        return service.files.length
      }

      /**
     *    Get all files.
     */
      function getItems () {
        return service.files
      }

      /**
     *    Remove all items frm the files array.
     */
      function removeItems () {
        service.files = []
        service.currentDocument = {}
        return false
      }

      /**
     *    Update the current document.
     *
     *    @param  {Object}  item  The document object.
     *                            Must have a `title`, `body` and `id` property
     *                            to work.
     */
      function setCurrentDocument (item) {
        service.currentDocument = item
        return item
      }

      /**
     *    Get the current document.
     */
      function getCurrentDocument () {
        return service.currentDocument
      }

      /**
     *    Update the current document title.
     *
     *    @param  {String}  title  The document title.
     */
      function setCurrentDocumentTitle (title) {
        service.currentDocument.title = title
        return title
      }

      /**
     *    Get the current document title.
     */
      function getCurrentDocumentTitle () {
        return service.currentDocument.title.replace(/(\\|\/)/g, '_')
      }

      /**
     *    Update the current document body.
     *
     *    @param  {String}  body  The document body.
     */
      function setCurrentDocumentBody (body) {
        service.currentDocument.body = body
        return body
      }

      /**
     *    Get the current document body.
     */
      function getCurrentDocumentBody () {
        service.setCurrentDocumentBody($rootScope.editor.getSession().getValue())
        return service.currentDocument.body
      }

      /**
     *    Append current value to cursor location.
     */
      function setCurrentCursorValue (value) {
        var position = $rootScope.editor.getCursorPosition()
        $rootScope.editor.getSession().insert(position, value)
        return value
      }

      /**
     *    Loose/weak check for a binary file type
     *    @param  {String}  text  Supposedly the text of a file.
     *
     */
      function isBinaryFile (text) {
        if (/[\x00-\x09\x0E-\x1F]/.test(text)) {
          return true
        }

        return false
      }

      /**
     *    Import a md file into dillinger.
     *
     *    @param  {File}  file  The file to import
     *            (see: https://developer.mozilla.org/en/docs/Web/API/File).
     *
     */
      function mdFileReader (file) {
        var reader = new window.FileReader()

        reader.onload = function (event) {
          var text = event.target.result

          if (isBinaryFile(text)) {
            return diNotify({
              message: 'Importing binary files will cause dillinger to become unresponsive',
              duration: 4000
            })
          }

          // Create a new document.
          var item = createItem()
          addItem(item)
          setCurrentDocument(item)

          // Set the new documents title and body.
          setCurrentDocumentTitle(file.name)
          setCurrentDocumentBody(text)

          // Refresh the editor and proview.
          $rootScope.$emit('document.refresh')
        }

        reader.readAsText(file)
      }

      /**
     *    Import an HTML file into dillinger.
     *
     *    @param  {File}  file  The file to import
     *            (see: https://developer.mozilla.org/en/docs/Web/API/File).
     *
     */
      function htmlFileReader (file) {
        var reader = new window.FileReader()

        reader.onload = function (event) {
          var text = event.target.result

          // Create a new document.
          var item = createItem()
          addItem(item)
          setCurrentDocument(item)

          // Set the new document's title.
          setCurrentDocumentTitle(file.name)
          // Call breakdance method to convert HTML to MD

          convertHTMLtoMD(text)
        }

        reader.readAsText(file)
      }

      /**
       * 
       * @param { string } path
       * @param { string } hash
       * @returns { Promise<Document | null> }
       */
      async function fetchDocument(path, hash) {
        const title = path.match(/\/([^\/]+)\.md$/);
        try {
          /** @type {Document[]} */
          const localFiles = angular.fromJson(window.localStorage.getItem('files')) || [];
          const localDocument = localFiles.find(f => f.title === title);
          if (localDocument) {
            const syncedDoc = synchronizeWithServer(localDocument)
            const metadata = await fetchMetadata(path);
            if (hash 
          }

          if (localDocument)
          return {
            body: res.text(),
            title,
          }
        } catch (e) {
          console.log(e);
          return null
        }
      }

      /**
       * 
       * @param { string } path 
       * @returns { Promise<Metadata> }
       */
      async function fetchMetadata(path) {
        const res = await fetch('/metadata/' + path);
        return angular.fromJson(res.text());
      }

      /**
       * @param {string} str
       * @returns {string}
       */
      async function sha256(str) {
        const encoder = new TextEncoder();
        const data = encoder.encode(str);
        const hashBuffer = await crypto.subtle.digest('SHA-256', data);
        const hashArray = Array.from(new Uint8Array(hashBuffer));
        return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
      }

      // TODO loadMetadata(path)

      /**
     *    Convert HTML text to markdown.
     *
     *    @param  {text}  string  The html text to be converted
     *
     */
      function convertHTMLtoMD (text) {
      // Add page title
        var di = diNotify({
          message: 'Converting HTML to Markdown...',
          duration: 2500
        })
        return $http.post('factory/html_to_md', {
          html: text
        }).then(function successCallback (result) {
          if (angular.isDefined(di.$scope)) {
            di.$scope.$close()
          }
          if (result.data.error) {
            return diNotify({
              message: 'An Error occured: ' + result.data.error.message,
              duration: 5000
            })
          } else {
          // Set the new document's body
          // console.log(result.data.convertedMd)
            setCurrentDocumentBody(result.data.convertedMd)

            // Refresh the editor and proview.
            $rootScope.$emit('document.refresh')

            // Track event in GA
            if (window.ga) {
              window.ga('send', 'event', 'click', 'Convert HTML to Markdown', 'Convert To...')
            }
          }
        }, function errorCallback (err) {
          if (angular.isDefined(di.$scope)) {
            di.$scope.$close()
          }
          return diNotify({
            message: 'An Error occured: ' + err.data.error.message,
            duration: 5000
          })
        })
      }

      /**
     *    Generic file import method. Checks for images and markdown.
     *
     *    @param  {File}  file  The file to import
     *            (see: https://developer.mozilla.org/en/docs/Web/API/File).
     *
     *    @param {Boolean} showTip set to true to show a tip message
     *                      about dragging and dropping files.
     */

      function importFile (file, showTip, isHTML) {
        if (!file) {
          return console.log('No file passed to importFile function.')
        }

        var reader = new window.FileReader()

        // If it is text or image or something else
        reader.onloadend = function (event) {
          var data = event.target.result

          var firstFourBitsArray = (new Uint8Array(data)).subarray(0, 4)

          var type = ''

          var header = ''

          // Snag hex value
          for (var i = 0; i < firstFourBitsArray.length; i++) {
            header += firstFourBitsArray[i].toString(16)
          }

          // Determine image type or unknown
          switch (header) {
            case '89504e47':
              type = 'image/png'
              break
            case '47494638':
              type = 'image/gif'
              break
            case 'ffd8ffe0':
            case 'ffd8ffe1':
            case 'ffd8ffe2':
              type = 'image/jpeg'
              break
            default:
              type = 'unknown'
              break
          }

          if (showTip) {
            diNotify({
              message: 'You can also drag and drop files into dillinger'
            })
          }

          if (type === 'unknown') {
            if (isHTML) return htmlFileReader(file)
            else return mdFileReader(file)
          } else {
          // Do the upload of the image to cloud service
          // and return an URL of the image
            return imageUploader(file)
          }
        }

        // Read as array buffer so we can determine if image
        // from the bits
        reader.readAsArrayBuffer(file)
      }

      /**
     *    Upload a file to a cloud service and return a URL.
     *
     *    @param  {File}  file  The file object
     *            (see: https://developer.mozilla.org/en/docs/Web/API/File).
     *
     */

      function imageUploader (file) {
        var reader = new window.window.FileReader()

        var name = file.name

        reader.onloadend = function () {
          var di = diNotify({
            message: 'Uploading Image to Dropbox...',
            duration: 5000
          })
          return $http.post('save/dropbox/image', {
            image_name: name,
            fileContents: reader.result
          }).then(function (result) {
            if (angular.isDefined(di.$scope)) {
              di.$scope.$close()
            }
            if (result.data.data && result.data.data.error) {
              return diNotify({
                message: 'An Error occured: ' + result.data.error,
                duration: 5000
              })
            } else {
              var publicUrl = result.data.data.url
              // Now take publicUrl and and wrap in markdown
              var template = '![' + name + '](' + publicUrl + ')'
              // Now take the ace editor cursor and make the current
              // value the template
              service.setCurrentCursorValue(template)

              // Track event in GA
              if (window.ga) {
                window.ga('send', 'event', 'click', 'Upload Image To Dropbox', 'Upload To...')
              }
              return diNotify({
                message: 'Successfully uploaded image to Dropbox.',
                duration: 4000
              })
            }
          }, function (err) {
            console.dir(err)
            return diNotify({
              message: 'An Error occured: ' + err.message,
              duration: 5000
            })
          })
        }
        reader.readAsDataURL(file)
      }

      function save (doc, manual) {
        if (!angular.isDefined(manual)) {
          manual = false
        }

        if (manual) {
          diNotify('Documents Saved!')
        }

        return window.localStorage.setItem('currentDocument', angular.toJson(doc));
      }

      function init () {
        var item, _ref
        service.files = angular.fromJson(window.localStorage.getItem('files')) || []
        service.currentDocument = angular.fromJson(window.localStorage.getItem('currentDocument')) || {}
        if (!((_ref = service.files) != null ? _ref.length : void 0)) {
          item = this.createItem()
          this.addItem(item)
          this.setCurrentDocument(item)
          return this.save(item)
        }
      }
    }) // end factory
