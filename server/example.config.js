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

// Do not edit this file!
var server = {
	dev : false,
	mysql : {
		host : 'hello_database_host',
		port : 3306,
		user : 'hello_database_user',
		pass : 'hello_database_password',
		name : 'hello_database_name',
	},
	tls : {
		keyPath : 'path_to_key.pem',
		certPath : 'path_to_cert.pem',
		key : null,
		cert : null,
	},
	fc : {
		host : 'friendcore_host',
		port : 6502,
	},
	defaults : {
		// ACCOUNT
		account : {
			skipPass : true,
			settings : {
				popupChat  : true,
				inAppMenu  : false,
				msgAlert   : true,
				advancedUI : true,
			},
		},
		module : {
			//Presence
			presence : {
				displayName : 'Presence',
				host : 'presence_domain',
				port : 27960,
				settings : {
					
				},
			},
			// TREEROOT
			treeroot : {
				host : 'friendup.world',
				settings : {
					msgCrypto : false,
				},
			},
			// IRC
			irc : {
				host : 'irc.freenode.net',
				displayName : 'Freenode',
				login : '',
				password : '',
				settings : {
					join : [
						'#friendup',
					],
					connect : {
						tls : true,
						sasl : false,
						autoshow : true,
						autojoin : true,
					},
					user : 'FUP-irc',
					realName : '-',
				},
			},
		},
	},
};

var shared = {
	tls : true,

	// port, listen
	// port is used by the client, set a number or fragment, 
	// depending on proxys and stuff.
	// listen is used by the server if defined.
	// example : server is listening on 3001 for chat sockets,
	// but is proxied by wss://example.com/hello/chat/
	// /hello/chat/ should be set as port in this config,
	// while 3001 should be set as listen
	// and is the actual port pointed to by the proxy:
	// port : '/hello/chat/',
	// listen : 3001,
	
	// if there is no proxy stuff, you can just use the port,
	// the server will use port if listen is not valid
	// port : 3001,
	// listen : null ( or simply undefined )
	
	http : {
		// not actually used, set in client config
		port : '/hello/',
		listen : 3000,
	},
	chat : {
		port : 3001,
		listen : null,
	},
	modules : {
		treeroot : {
			type : 'treeroot',
			name : 'Treeroot',
		},
		irc : {
			type : 'irc',
			name : 'IRC',
		},
	},
};

var conf = {
	shared : shared,
	server : server,
};

module.exports = conf;
