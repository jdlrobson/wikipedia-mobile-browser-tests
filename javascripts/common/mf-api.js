( function( M, $ ) {

	var oop = M.require( 'oop' ),
		EventEmitter = M.require( 'eventemitter' ),
		api;

	// TODO: this might be dangerous and cause conflicts with other code
	// should we move it to Api#ajax?
	$.ajaxSetup( {
		url: M.getApiUrl(),
		dataType: 'json',
		data: {
			format: 'json'
		}
	} );

	function Api() {
		this.requests = [];
		this.tokenCache = {};
	}

	/**
	 * A wrapper for $.ajax() to be used when calling server APIs.
	 * Preprocesses data argument in the following way:
	 * - removes boolean values equal to false
	 * - concatenates Array values with '|'
	 *
	 * @example
	 * <code>
	 * ajax( { a: false, b: [1, 2, 3] }, { type: 'post' } );
	 * // is equal to
	 * $.ajax( {
	 *     type: 'post',
	 *     data: { b: '1|2|3' }
	 * } );
	 * </code>
	 *
	 * @param {Object} data Data to be preprocessed and added to options
	 * @param {Object} options Parameters passed to $.ajax()
	 * @return {jQuery.Deferred} Object returned by $.ajax()
	 */
	Api.prototype.ajax = function( data, options ) {
		var key, request;
		options = $.extend( {}, options );

		if (
			typeof data !== 'string' &&
			( typeof FormData === 'undefined' || !( data instanceof FormData ) )
		) {
			for ( key in data ) {
				if ( data[key] === false ) {
					delete data[key];
				} else if ( $.isArray( data[key] ) ) {
					data[key] = data[key].join( '|' );
				}
			}
		}
		options.data = data;

		// FIXME: uncomment when https://bugzilla.wikimedia.org/show_bug.cgi?id=44921 is resolved
		/*
		options.xhr = function() {
			var xhr = $.ajaxSettings.xhr();
			if ( xhr.upload ) {
				// need to bind this event before we open the connection (see note at
				// https://developer.mozilla.org/en-US/docs/DOM/XMLHttpRequest/Using_XMLHttpRequest#Monitoring_progress)
				xhr.upload.addEventListener( 'progress', function( ev ) {
					request.emit( 'progress', ev );
				} );
			}
			return xhr;
		};
		*/

		request = $.ajax( options );
		$.extend( request, EventEmitter.prototype );
		this.requests.push( request );
		return request;
	};

	/**
	 * A wrapper for $.ajax() to be used when calling server APIs.
	 * Sends a GET request. See ajax() for details.
	 *
	 * @param {Object} data Data to be preprocessed and added to options
	 * @param {Object} options Parameters passed to $.ajax()
	 * @return {jQuery.Deferred} Object returned by $.ajax()
	 */
	Api.prototype.get = function( data, options ) {
		options = $.extend( {}, options, { type: 'GET' } );
		return this.ajax( data, options );
	};

	/**
	 * A wrapper for $.ajax() to be used when calling server APIs.
	 * Sends a POST request. See ajax() for details.
	 *
	 * @param {Object} data Data to be preprocessed and added to options
	 * @param {Object} options Parameters passed to $.ajax()
	 * @return {jQuery.Deferred} Object returned by $.ajax()
	 */
	Api.prototype.post = function( data, options ) {
		options = $.extend( {}, options, { type: 'POST' } );
		return this.ajax( data, options );
	};

	/**
	 * Abort all unfinished requests issued by this Api object.
	 */
	Api.prototype.abort = function() {
		this.requests.forEach( function( request ) {
			request.abort();
		} );
	};

	Api.prototype.getToken = function( tokenType, callback, endpoint ) {
		var data;
		if ( !this.tokenCache[ endpoint ] ) {
			this.tokenCache[ endpoint ] = {};
		}
		if ( !M.isLoggedIn() ) {
			callback( {} ); // return no token
		} else if ( this.tokenCache[ endpoint ].hasOwnProperty( tokenType ) ) {
			this.tokenCache[ endpoint ][ tokenType ].done( callback );
		} else {
			data = {
				action: 'tokens',
				type: tokenType
			};
			if ( endpoint ) {
				data.origin = M.getOrigin();
			}
			this.tokenCache[ endpoint ][ tokenType ] = this.ajax( data, {
				url: endpoint || M.getApiUrl(),
				xhrFields: { 'withCredentials': true }
			} ).done( callback );
		}
	};

	Api.extend = oop.extend;

	api = new Api();
	api.Api = Api;

	M.define( 'api', api );

}( mw.mobileFrontend, jQuery ) );
