/*©agpl*************************************************************************
*                                                                              *
* This file is part of FRIEND UNIFYING PLATFORM.                               *
*                                                                              *
* This program is free software: you can redistribute it and/or modify         *
* it under the terms of the GNU Affero General Public License as published by  *
* the Free Software Foundation, either version 3 of the License, or            *
* (at your option) any later version.                                          *
*                                                                              *
* This program is distributed in the hope that it will be useful,              *
* but WITHOUT ANY WARRANTY; without even the implied warranty of               *
* MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the                 *
* GNU Affero General Public License for more details.                          *
*                                                                              *
* You should have received a copy of the GNU Affero General Public License     *
* along with this program.  If not, see <http://www.gnu.org/licenses/>.        *
*                                                                              *
*****************************************************************************©*/

var library = window.library || {};
var friendUP = window.friendUP || {};
var hello = window.hello || {};

library.view = library.view || {};

// BaseView - NYI - maybe never?
(function( ns, undefined ) {
	ns.BaseView = function() {
		
	}
})( library.view );

// BASE CONTACT
(function( ns, undefined ) {
	ns.BaseContact = function( conf ) {
		if ( !( this instanceof ns.BaseContact ))
			return new ns.BaseContact( conf );
		
		var self = this;
		library.component.EventEmitter.call( self, eventSink );
		self.clientId = self.data.clientId;
		self.id = self.clientId;
		self.identity = self.data.identity;
		self.containerId = conf.containerId;
		
		self.view = null;
		
		self.baseContactInit( conf.parentView );
		
		function eventSink() {
			//console.log( 'BaseContact, eventSink', arguments );
		}
	}
	
	ns.BaseContact.prototype = Object.create( library.component.EventEmitter.prototype );
	
	// Public
	
	ns.BaseContact.prototype.getName = function() {
		const self = this;
		return self.identity.name || '';
	}
	
	ns.BaseContact.prototype.getOnline = function() {
		const self = this;
		return false;
	}
	
	ns.BaseContact.prototype.getAvatar = function() {
		const self = this;
		return self.identity.avatar || '';
	}
	
	ns.BaseContact.prototype.getUnreadMessages = function() {
		const self = this;
		return 0;
	}
	
	ns.BaseContact.prototype.getLastMessage = function() {
		const self = this;
		return '';
	}
	
	ns.BaseContact.prototype.openChat = function() {
		const self = this;
		self.handleAction( 'open-chat' );
	}
	
	ns.BaseContact.prototype.startVideo = function( perms ) {
		const self = this;
		//self.startLive( 'video', perms );
		self.handleAction( 'live-video', perms );
	}
	
	ns.BaseContact.prototype.startVoice = function( perms ) {
		const self = this;
		//self.startLive( 'audio', perms );
		self.handleAction( 'live-audio', perms );
	}
	
	ns.BaseContact.prototype.handleAction = function( action, data ) {
		const self = this;
		self.send({
			type : action,
			data : data,
		});
	}
	
	// Private
	
	ns.BaseContact.prototype.getMenuOptions = function() {
		throw new Error( 'BaseContact.getMenuOptions - implement in extension' );
	}
	
	ns.BaseContact.prototype.baseContactInit = function( parentView ) {
		var self = this;
		self.menuActions = new library.component.MiniMenuActions();
		self.view = new library.component.SubView({
			parent : parentView,
			type : self.clientId,
		});
		
		self.view.on( 'identity', updateIdentity );
		function updateIdentity( msg ) { self.updateIdentity( msg ); }
		
		self.buildElement(); // must be defined for each contact
		self.bindItem();
	}
	
	ns.BaseContact.prototype.updateIdentity = function( id ) {
		var self = this;
		self.identity = id;
		self.updateName();
	}
	
	ns.BaseContact.prototype.updateName = function() {
		var self = this;
		var element = document.getElementById( self.clientId );
		var nameElement = element.querySelector( '.contact-name' );
		nameElement.textContent = self.identity.name;
	}
	
	ns.BaseContact.prototype.bindItem = function() {
		var self = this;
		var element = document.getElementById( self.clientId );
		self.itemMenu = element.querySelector( '.item-menu' );
		
		element.addEventListener( 'click', click, false );
		if ( self.itemMenu )
			self.itemMenu.addEventListener( 'click', menuClick, false );
		
		function click( e ) { self.openChat(); }
		function menuClick( e ) { self.showMenu( e ); }
	}
	
	ns.BaseContact.prototype.showMenu = function( e ) {
		const self = this;
		e.stopPropagation();
		const options = self.getMenuOptions();
		if ( !options || !options.length )
			return;
		
		new library.component.MiniMenu(
			hello.template,
			self.itemMenu,
			'hello',
			options,
			onSelect
		);
		
		function onSelect( selected ) {
			self.handleAction( selected );
		}
	}
	
	ns.BaseContact.prototype.startLive = function( mode, perms ) {
		var self = this;
		mode = mode || 'video';
		self.send({
			type : 'start-live',
			data : {
				mode        : mode,
				permissions : perms,
			},
		});
	}
	
	ns.BaseContact.prototype.remove = function() {
		var self = this;
		self.send({
			type: 'remove',
		});
	}
	
	ns.BaseContact.prototype.send = function( msg ) {
		var self = this;
		self.view.sendMessage( msg );
	}
	
	ns.BaseContact.prototype.close = function() {
		var self = this;
		self.view.close();
		
		var element = document.getElementById( self.clientId );
		element.parentNode.removeChild( element );
		self.closeEventEmitter();
	}
	
})( library.view );


// BASEMODULE
(function( ns, undefined ) {
	ns.BaseModule = function( conf ) {
		if ( !( this instanceof ns.BaseModule ))
			return new ns.BaseModule( conf );
		
		var self = this;
		library.component.EventEmitter.call( self, eventSink );
		self.clientId = conf.module.clientId;
		self.id = self.clientId;
		self.containers = conf.containers
		self.type = conf.module.type;
		self.module = conf.module;
		self.identity = conf.identity;
		self.tmplId = conf.tmplId || '';
		
		self.mod = null;
		self.rooms = {};
		self.contacts = {};
		self.contactsId = friendUP.tool.uid( 'contacts' );
		self.connectionState = friendUP.tool.uid( 'connectionIndicator' );
		self.updateMap = null;
		self.contactsFoldit = friendUP.tool.uid( 'foldit' );
		
		//self.optionMenu = friendUP.tool.uid( 'options' );
		self.options = {};
		
		self.initBaseModule( conf.parentView );
		
		function eventSink() {
			//console.log( 'BaseModule, eventSink', arguments );
		}
	}
	
	ns.BaseModule.prototype = Object.create( library.component.EventEmitter.prototype );
	
	// Public
	
	// Implement in module
	
	/*
	getMenuOptions
	
	returns an array of actions available for the module.
	Predefined actions can be used from self.menuActions,
	an instance of library.component.MiniMenuActions
	*/
	ns.BaseModule.prototype.getMenuOptions = function() {
		const self = this;
		return [
			self.menuActions[ 'settings' ],
		];
	}
	
	/*
	setLogo
	
	Does nothing for normal UI. For advanced UI it sets the logo
	in the head of the module
	
	*/
	ns.BaseModule.prototype.setLogo = function() {
		const self = this;
		const conf = {
		};
		self.setLogoCss( conf );
	}
	
	/*
	updateTitle
	
	Updates the head bar of the module during initializtion and in response
	to various events from app
	
	Use with base module template, implement in module of custom templates
	where the selector no longer fits
	*/
	ns.BaseModule.prototype.updateTitle = function() {
		const self = this;
		const title = self.getTitleString();
		const parentElement = document.getElementById( self.clientId );
		const titleElement = parentElement.querySelector( '.module-title' );
		titleElement.textContent = title;
	}
	
	/*
	bindMenuButton
	
	binds the minimenu button on the module head, implement for module
	if this queryselector no longer fits
	
	*/
	ns.BaseModule.prototype.bindMenuButton = function() {
		const self = this;
		const roomsEl = document.getElementById( self.roomsId );
		const contactsEl = document.getElementById( self.contactsId );
		if ( roomsEl ) {
			self.roomsMenu = roomsEl.querySelector( '.actions .item-menu' );
			self.roomsMenu.addEventListener( 'click', roomsMenuClick, false );
		}
		
		if ( contactsEl ) {
			self.contactsMenu = contactsEl.querySelector( '.actions .item-menu' );
			self.contactsMenu.addEventListener( 'click', contactsMenuClick, false );
		}
		
		function roomsMenuClick( e ) {
			e.stopPropagation();
			e.preventDefault();
			self.showMenu( 'conference' );
		}
		
		function contactsMenuClick( e ) {
			e.stopPropagation();
			e.preventDefault();
			self.showMenu( 'contacts' );
		}
	}
	
	// Private
	
	ns.BaseModule.prototype.initBaseModule = function( parentConn ) {
		var self = this;
		if ( !self.identity ) {
			self.identity = {
				name : '---',
				avatar : null,
			};
		}
		
		self.buildElement();
		self.setCss();
		self.initFoldit();
		self.initStatus();
		self.bindMenuButton();
		self.updateTitle();
		
		self.menuActions = new library.component.MiniMenuActions();
		
		// app.module interface
		self.mod = new library.component.SubView({
			parent : parentConn,
			type : self.clientId,
		});
		self.mod.on( 'connection', connection );
		self.mod.on( 'remove', removeContact );
		self.mod.on( 'update', applyUpdate );
		self.mod.on( 'query', handleQuery );
		self.mod.on( 'info', handleInfo );
		
		function connection( e ) { self.connectionHandler( e ); }
		function removeContact( e ) { self.removeContact( e ); }
		function applyUpdate( e ) { self.updateHandler( e ); }
		function handleQuery( e ) { self.queryHandler( e ); }
		function handleInfo( e ) { self.infoHandler( e ); }
		
		self.updateMap = {
			'module' : updateModule,
			'identity' : updateIdentity,
		};
		
		function updateModule( msg ) { self.updateModule( msg ); }
		function updateIdentity( msg ) { self.updateIdentity( msg ); }
		
		self.errorStrings = {
			'ERR_HOST_ENOTFOUND'    : View.i18n('i18n_host_was_not_found'),
			'ERR_HOST_EHOSTUNREACH' : View.i18n('i18n_host_is_unreachable'),
			'ERR_HOST_ETIMEDOUT'    : View.i18n('i18n_connection_timed_out'),
			'ERR_RESPONSE_NOT_OK'   : View.i18n('i18n_host_declined_request'),
		}
		
		
		self.queryMap = {
			'text'           : queryText,
			'secure'         : querySecure,
			'secure-confirm' : querySecureConfirm,
			'password'       : queryPassword,
		};
		
		function queryText( e ) { self.queryText( e ); }
		function querySecure( e ) { self.querySecure( e ); }
		function querySecureConfirm( e ) { self.querySecureConfirm( e ); }
		function queryPassword( e ) { self.queryPassword( e ); }
		
		self.infoMap = {
			'clear'        : clearInfo,
			'message'      : showMessage,
			'initializing' : showInitializing,
		};
		
		function clearInfo( e ) { self.clearInfo( e ); }
		function showMessage( e ) { self.showMessage( e ); }
		function showInitializing( e ) { self.showInitializing( e ); }
		
		const boxConf = {
			element     : null,
			containerId : self.activeId || self.contactsId,
		};
		self.serverMessage = new library.component.InfoBox( boxConf );
		
	}
	
	ns.BaseModule.prototype.showMenu = function() {
		const self = this;
		const opts = self.getMenuOptions();
		if ( !opts || !opts.length )
			return;
		
		new library.component.MiniMenu(
			hello.template,
			self.itemMenu,
			'hello',
			opts,
			onSelect
		);
		
		function onSelect( action ) {
			self.handleAction( action );
		}
	}
	
	ns.BaseModule.prototype.handleAction = function( type, data ) {
		const self = this;
		self.send({
			type : type,
			data : data,
		});
	}
	
	// this is an example implementation, modules probably need 
	// something specific to their own needs
	ns.BaseModule.prototype.buildElement = function() {
		var self = this;
		var tmplId = self.tmplId || 'base-module-tmpl';
		var conf = {
			clientId          : self.clientId,
			folditId          : self.contactsFoldit,
			moduleTitle       : self.module.name,
			connectionStateId : self.connectionState,
			optionId          : self.optionMenu,
			contactsId        : self.contactsId,
		};
		
		var element = hello.template.getElement( tmplId, conf );
		var container = document.getElementById( self.containers[ self.moduleType ]);
		container.appendChild( element );
	}
	
	ns.BaseModule.prototype.initFoldit = function() {
		var self = this;
		self.contactsFoldit = new library.component.Foldit({
			folderId : self.contactsFoldit,
			foldeeId : self.contactsId
		});
	}
	
	ns.BaseModule.prototype.initStatus = function() {
		var self = this;
		self.connectionState = new library.component.StatusIndicator({
			containerId : self.connectionState,
			type      : 'icon',
			cssClass  : 'fa-circle-o',
			statusMap : {
				offline    : 'Off'    ,
				online     : 'On'     ,
				open       : 'Warning',
				connecting : 'Notify' ,
				error      : 'Alert'  ,
			},
		});
	}
	
	ns.BaseModule.prototype.setLogoCss = function( conf, tmplId ) {
		var self = this;
		tmplId = tmplId || 'fa-icon-logo-css-tmpl';
		conf.moduleId = self.clientId;
		
		var cssId = self.getCssId();
		var exists = document.getElementById( cssId );
		if ( exists )
			self.removeCss();
		
		var cssElement = hello.template.getElement( tmplId, conf );
		document.head.appendChild( cssElement );
	}
	
	ns.BaseModule.prototype.removeCss = function() {
		var self = this;
		var cssId = self.getCssId();
		var cssElement = document.getElementById( cssId );
		if ( !cssElement ) {
			console.log( 'moduleView.removeCss - could not', { id : cssId, self : self });
			return;
		}
		
		cssElement.parentNode.removeChild( cssElement );
	}
	
	ns.BaseModule.prototype.getCssId = function() {
		var self = this;
		var id = self.clientId + '-module-css';
		return id;
	}
	
	ns.BaseModule.prototype.showInitializing = function() {
		var self = this;
		if ( self.initalized )
			return;
		
		var id = friendUP.tool.uid( 'init' );
		var conf = {
			id : id,
		};
		var element = hello.template.getElement( 'module-initializing-tmpl', conf );
		self.serverMessage.show( element );
	}
	
	ns.BaseModule.prototype.clearInfo = function() {
		var self = this;
		self.serverMessage.hide();
	}
	
	ns.BaseModule.prototype.showMessage = function( message ) {
		var self = this;
		var id = friendUP.tool.uid( 'message' );
		var conf = {
			id : id,
			message : message,
		};
		var element = hello.template.getElement( 'module-message-tmpl', conf );
		self.serverMessage.show( element );
	}
	
	ns.BaseModule.prototype.connectionHandler = function( state ) {
		var self = this;
		if ( !self.connectionState )
			throw new Error( 'connectionState is not defined, use library.component.' );
		
		self.connectionState.set( state.type );
	}
	
	ns.BaseModule.prototype.updateHandler = function( update ) {
		var self = this;
		if ( !self.updateMap )
			throw new Error( 'no updateMap defined for module: ' + self.type );
		
		var handler = self.updateMap[ update.type ];
		if ( !handler ) {
			console.log( 'moduleView.updateHandler - no handler for', update );
			return;
		}
		
		handler( update.data );
	}
	
	ns.BaseModule.prototype.updateModule = function( update ) {
		var self = this;
		self.module.name = update.name;
		self.updateTitle();
	}
	
	ns.BaseModule.prototype.updateIdentity = function( update ) {
		var self = this;
		self.identity = update;
		self.updateTitle();
	}
	
	ns.BaseModule.prototype.queryHandler = function( msg ) {
		var self = this;
		var handler = self.queryMap[ msg.type ];
		if ( !handler ) {
			console.log( 'mod.handleQuery - no handler for', msg );
			return;
		}
		
		handler( msg.data );
	}
	
	ns.BaseModule.prototype.querySecure = function( data ) {
		var self = this;
		var tmplConf = {
			id : friendUP.tool.uid( 'query-secure' ),
			message : data.message || '',
			placeholder : data.value || '',
		};
		var element = hello.template.getElement( 'query-secure-tmpl', tmplConf );
		self.serverMessage.show( element );
		bind( element );
		
		function bind( element ) {
			var input = element.querySelector( 'input' );
			element.addEventListener( 'submit', passSubmit, false );
			function passSubmit( e ) {
				e.preventDefault();
				e.stopPropagation();
				var callbackId = data.callbackId;
				var value = input.value.trim();
				if ( !value.length )
					return;
				
				self.returnQuery( callbackId, value );
			}
		}
	}
	
	ns.BaseModule.prototype.querySecureConfirm = function( data ) {
		var self = this;
		var conf = {
			id      : friendUP.tool.uid( 'query-secure-confirm' ),
			message : data.message || '',
			value : data.value || '',
		};
		var element = hello.template.getElement( 'query-secure-confirm-tmpl', conf );
		self.serverMessage.show( element );
		bind( element );
		
		function bind( element ) {
			var input = element.querySelector( 'input' );
			var secBtn = element.querySelector( 'button' );
			element.addEventListener( 'submit', submit, false );
			
			function submit( e ) {
				e.preventDefault();
				e.stopPropagation();
				var callbackId = data.callbackId;
				var value = input.value.trim();
				if ( !value.length )
					return;
				
				self.returnQuery( callbackId, value );
			}
		}
	}
	
	ns.BaseModule.prototype.queryPassword = function( data ) {
		var self = this;
		var tmplConf = {
			id : friendUP.tool.uid( 'query-password' ),
			message : data.message || '',
			resetLink : data.value || '',
		};
		var element = hello.template.getElement( 'query-password-tmpl', tmplConf );
		self.serverMessage.show( element );
		bind( element );
		
		function bind( element ) {
			var input = element.querySelector( 'input' );
			var passBtn = element.querySelector( '.pass-reset' );
			element.addEventListener( 'submit', passSubmit, false );
			passBtn.addEventListener( 'click', resetClick, false );
			
			function passSubmit( e ) {
				e.preventDefault();
				e.stopPropagation();
				var callbackId = data.callbackId;
				var value = input.value.trim();
				if ( !value.length )
					return;
				
				self.returnQuery( callbackId, value );
			}
			
			function resetClick( e ) {
				e.stopPropagation();
				e.preventDefault();
				var passReset = {
					type : 'pass-reset',
				}
				
				self.send( passReset );
				self.serverMessage.hide();
			}
		}
	}
	
	ns.BaseModule.prototype.queryText = function( data ) {
		var self = this;
		var conf = {
			id : friendUP.tool.uid( 'query-text' ),
			message : data.message || '',
			value : data.value || '',
		};
		var element = hello.template.getElement( 'query-text-tmpl', conf );
		self.serverMessage.show( element );
		bind( element );
		
		function bind( element ) {
			var input = element.querySelector( 'input' );
			element.addEventListener( 'submit', submit, false );
			function submit( e ) {
				e.preventDefault();
				e.stopPropagation();
				var callbackId = data.callbackId;
				var value = input.value.trim();
				if ( !value.length )
					return;
				
				self.returnQuery( callbackId, value );
			}
		}
	}
	
	ns.BaseModule.prototype.returnQuery = function( callbackId, value ) {
		var self= this;
		var data = {
			value : value,
			callbackId : callbackId,
		};
		
		var wrap = {
			type : 'query',
			data : data,
		};
		
		self.send( wrap );
		self.serverMessage.hide();
	}
	
	ns.BaseModule.prototype.infoHandler = function( info ) {
		var self = this;
		var handler = self.infoMap[ info.type ];
		if ( !handler ) {
			console.log( 'no handler for info', info );
			return;
		}
		
		handler( info.data );
	}
	
	ns.BaseModule.prototype.getTitleString = function() {
		var self = this;
		var title = '';
		var modName = '';
		if ( self.identity )
			title = self.identity.name || '';
		
		if ( self.module )
			modName = self.module.name || '';
		
		if ( title.length && modName.length )
			title += ( ' - ' + modName );
		else
			title = modName;
		
		return title;
	}
	
	ns.BaseModule.prototype.removeContact = function( clientId ) {
		var self = this;
		var contact = self.contacts[ clientId ];
		if ( !contact ) {
			console.log( 'no contact for', { id : clientId, contacts : self.contacts });
			return;
		}
		
		self.emit( 'remove', clientId );
		contact.close();
		delete self.contacts[ clientId ];
	}
	
	ns.BaseModule.prototype.optionSettings = function() {
		var self = this;
		self.send({
			type : 'settings',
		});
	}
	
	ns.BaseModule.prototype.optionReconnect = function() {
		var self = this;
		self.send({
			type : 'reconnect',
		});
	}
	
	ns.BaseModule.prototype.optionDisconnect = function( msg ) {
		var self = this;
		self.send({
			type : 'disconnect',
		});
	}
	
	ns.BaseModule.prototype.optionRemove = function() {
		var self = this;
		self.send({
			type : 'remove',
		});
	}
	
	ns.BaseModule.prototype.send = function( msg ) {
		var self = this;
		self.mod.sendMessage( msg );
	}
	
	ns.BaseModule.prototype.close = function() {
		var self = this;
		self.mod.close();
		self.removeCss();
		//main.menu.remove( self.menuId );
		
		var element = document.getElementById( self.clientId );
		element.parentNode.removeChild( element );
		self.closeEventEmitter();
		
		delete self.menuActions;
	}
	
})( library.view );
