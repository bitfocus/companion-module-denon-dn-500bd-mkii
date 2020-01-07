var tcp           = require('../../tcp');
var instance_skel = require('../../instance_skel');
var debug;
var log;

function pad2(num) {
	var s = "00" + num;
	return s.substr(s.length-2);
}

function pad4(num) {
	var s = "0000" + num;
	return s.substr(s.length-4);
}

function instance(system, id, config) {
	var self = this;

	// super-constructor
	instance_skel.apply(this, arguments);

	self.actions(); // export actions
	self.init_presets();

	return self;
}

instance.prototype.updateConfig = function(config) {
	var self = this;
	self.init_presets();

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.config = config;
    self.init_tcp();

};

instance.prototype.init = function() {
	var self = this;

	debug = self.debug;
	log = self.log;
	self.init_presets();
    self.init_tcp();

};

instance.prototype.init_tcp = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
		delete self.socket;
	}

	self.status(self.STATE_WARNING, 'Connecting');

	if (self.config.host) {
		self.socket = new tcp(self.config.host, self.config.port);

		self.socket.on('status_change', function (status, message) {
			self.status(status, message);
		});

		self.socket.on('error', function (err) {
			debug("Network error", err);
			self.status(self.STATE_ERROR, err);
			self.log('error',"Network error: " + err.message);
		});

		self.socket.on('connect', function () {
			self.status(self.STATE_OK);
			debug("Connected");
		})

		//self.socket.on('data', function (data) {});
	}
};


// Return config fields for web config
instance.prototype.config_fields = function () {
	var self = this;

	return [
/*		{
			type: 'text',
			id: 'info',
			label: 'Information',
			width: 12,
			value: 'Please keep in mind that UDP support on port 9000 is not implemented yet in the Coyote firmware.'
		},
*/		{
			type: 'textinput',
			id: 'host',
			label: 'Target IP',
			width: 5,
			regex: self.REGEX_IP
		},
		{
			type: 'textinput',
			id: 'port',
			label: 'Target Port (Default: 9030)',
			width: 3,
			default: 9030,
			regex: self.REGEX_PORT
		}
	]
};

// When module gets deleted
instance.prototype.destroy = function() {
	var self = this;

	if (self.socket !== undefined) {
		self.socket.destroy();
	}

	debug("destroy", self.id);
};

/*
instance.prototype.CHOICES_COMMANDS = [
	{ id: 'play', 					label: 'Play', 					value: '0'},
	{ id: 'pause', 					label: 'Pause', 				value: '0'},
	{ id: 'end', 						label: 'End', 					value: '0'},
	{ id: 'take_next', 			label: 'Take Next'},
	{ id: 'take_prev', 			label: 'Take Prev'},
	{ id: 'select_next', 		label: 'Select Next'},
	{ id: 'select_prev', 		label: 'Select Prev'},
	{ id: 'select_preset',	label: 'Select Preset', value: '0'},
];

instance.prototype.CHOICES_SEEK_TO = [
	{ id: 'seek_to', label: 'Seek to 1 sec',	value: '0', time: '1000'},
	{ id: 'seek_to', label: 'Seek to 5 sec', 	value: '0', time: '5000'},
	{ id: 'seek_to', label: 'Seek to 10 sec', value: '0', time: '10000'},
	{ id: 'seek_to', label: 'Seek to 30 sec', value: '0', time: '30000'},
];

instance.prototype.CHOICES_SYSTEM = [
	{ id: 'reboot', 			label: 'Reboot' },
	{ id: 'soft_reboot', 	label: 'Soft Reboot' },
	{ id: 'shutdown', 		label: 'Shutdown' },
];
*/

instance.prototype.CHOICES_POWER = [
	{ id: 'PW00', 	    label: 'Power On' },
	{ id: 'PW01', 	    label: 'Power Off' }
];

instance.prototype.CHOICES_DISC_DRIVE = [
	{ id: 'PCDTRYOP', 	label: 'Eject' },
	{ id: 'PCDTRYCL', 	label: 'Close' }
];

instance.prototype.CHOICES_TRACK_PLAYBACK = [
	{ id: '2353', 	    label: 'PLay' },
	{ id: '2348', 	    label: 'Pause' },
	{ id: '2354', 	    label: 'Stop' },
	{ id: 'mt00', 	    label: 'Turn Myte On' },
	{ id: 'mt01',   	label: 'Turn Myte Off' },
];

instance.prototype.CHOICES_TRACK_SELECTION = [
	{ id: '2333', 	    label: 'Restart/Previus Track' },
	{ id: '2332', 	    label: 'Next Track' },
	{ id: 'Tr',         label: 'Select Track' },
];

instance.prototype.CHOICES_TITLE_SELECTION = [
	{ id: 'PCGPPV',	    label: 'Restart/Previus Title' },
	{ id: 'PCGPNX',	    label: 'Next Title' },
	{ id: 'PCGp',       label: 'Select Title' },
];

instance.prototype.CHOICES_TRACK_SEARCHING = [
	{ id: 'PCSLSR', 	label: 'Rewind' },
	{ id: 'PCGPPV', 	label: 'Fast Forward' },
];

instance.prototype.CHOICES_IR_LOCK = [
	{ id: 'PCIRLK00',	label: 'IR Lock' },
	{ id: 'PCIRLK01',	label: 'IR Unlock' },
];

instance.prototype.CHOICES_PANEL_LOCK = [
	{ id: '23KL',   	label: 'Panel Lock' },
	{ id: '23KU',   	label: 'Panel Unlock' },
];

instance.prototype.CHOICES_TIME_DISPLAY = [
	{ id: 'PCTMDEL',	label: 'Display Track Elapsed' },
	{ id: 'PCTMDRM',	label: 'Display Track Remaining' },
	{ id: 'PCTMDTL',	label: 'Display Total Elapsed' },
	{ id: 'PCTMDTR',	label: 'Display Total Remaining' },
];

instance.prototype.CHOICES_REPEAT = [
	{ id: 'PCRPAF',   	label: 'Set A for A-B Repeat' },
	{ id: 'PCRPBF',   	label: 'Set B and Start Repeat for A-B Repeat' },
	{ id: 'PCEXRP',   	label: 'Exit A-B Repeat' },
];

instance.prototype.CHOICES_PROGRAM_MODE = [
	{ id: 'PCPMP00',   	label: 'On' },
	{ id: 'PCPMP01',   	label: 'Off' },
];

instance.prototype.CHOICES_RANDOM_MODE_TYPE = [
	{ id: 'S',   	label: 'Shuffle' },
	{ id: 'R',   	label: 'Random' },
];

instance.prototype.CHOICES_RANDOM_MODE_MODE = [
	{ id: 'OF',   	label: 'Off' },
	{ id: 'SI',   	label: 'Sub Item' },
	{ id: 'IT',   	label: 'Item' },
	{ id: 'AL',   	label: 'All' },
];

instance.prototype.CHOICES_HIDE_OSD = [
	{ id: 'DVHOSD00',   	label: 'Hido OSD' },
	{ id: 'DVHOSD01',   	label: 'Show OSD' },
];

instance.prototype.CHOICES_DVD_MENU = [
	{ id: 'PCSU',   	label: 'Setup Menu' },
	{ id: 'DVTP',   	label: 'Top Menu' },
	{ id: 'DVPO',   	label: 'Option Menu' },
	{ id: 'DVPU',   	label: 'Pop Up Menu' },
	{ id: 'PCRTN',   	label: 'Return' },
];

instance.prototype.CHOICES_AUDIO_DIALOG = [
	{ id: 'DVADLG+',   	label: 'Primary Dialog' },
	{ id: 'DVADLG-',   	label: 'Secondary Dialog' },
];

instance.prototype.CHOICES_CURSOR = [
	{ id: 'PCCUSR1',   	label: 'Cursor Left' },
	{ id: 'PCCUSR2',   	label: 'Cursor Right' },
	{ id: 'PCCUSR3',   	label: 'Cursor Up' },
	{ id: 'PCCUSR4',   	label: 'Cursor Down' },
];

instance.prototype.CHOICES_VIDEO_RESOLUTION = [
	{ id: 'DVVR1',   	label: 'Auto' },
	{ id: 'DVVR2',   	label: '480/560i' },
	{ id: 'DVVR3',   	label: '480/560p' },
	{ id: 'DVVR4',   	label: '720p' },
	{ id: 'DVVR5',   	label: '1080i' },
	{ id: 'DVVR6',   	label: '1080p' },
];

instance.prototype.CHOICES_FUNCTIONS_COLOR = [
	{ id: 'DVFCLR1',   	label: 'Red Function' },
	{ id: 'DVFCLR2',   	label: 'Green Function' },
	{ id: 'DVFCLR3',   	label: 'Blue Function' },
	{ id: 'DVFCLR4',   	label: 'Yellow Function' },
];

instance.prototype.CHOICES_SEARCH_SPEED = [
	{ id: 'f',       	label: 'Fast Speed' },
	{ id: 's',     	    label: 'Slow Speed' },
];

instance.prototype.CHOICES_DVD_AUTO = [
	{ id: 'PCAP00',   	label: 'Auto PLay On' },
	{ id: 'PCAP01',   	label: 'Auto Play Off' },
];

instance.prototype.CHOICES_AUTO_RESUME = [
	{ id: 'PCAR00',   	label: 'Enable Auto Resume' },
	{ id: 'PCAR01',   	label: 'Disable Auto Resume' },
];

instance.prototype.init_presets = function () {
	var self = this;
	var presets = [];
	var pstSize = '18';

	for (var input in self.CHOICES_COMMANDS) {
		presets.push({
			category: 'Commands',
			label: self.CHOICES_COMMANDS[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_COMMANDS[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: 0
			},
			actions: [{
				action: self.CHOICES_COMMANDS[input].id,
				options: {
					id: self.CHOICES_COMMANDS[input].value,
				}
			}]
		});
	}

	for (var input in self.CHOICES_SEEK_TO) {
		presets.push({
			category: 'Commands',
			label: self.CHOICES_SEEK_TO[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_SEEK_TO[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: 0
			},
			actions: [{
				action: self.CHOICES_SEEK_TO[input].id,
				options: {
					id: self.CHOICES_SEEK_TO[input].value,
					seek_time: self.CHOICES_SEEK_TO[input].time
				}
			}]
		});
	}

	for (var input in self.CHOICES_SYSTEM) {
		presets.push({
			category: 'System',
			label: self.CHOICES_SYSTEM[input].label,
			bank: {
				style: 'text',
				text: self.CHOICES_SYSTEM[input].label,
				size: pstSize,
				color: '16777215',
				bgcolor: self.rgb(0,0,0)
			},
			actions: [{
				action: self.CHOICES_SYSTEM[input].id,
			}]
		});
	}

	self.setPresetDefinitions(presets);
}

instance.prototype.actions = function(system) {
	var self = this;

	self.system.emit('instance_actions', self.id, {
		'power': {
			label: 'Power',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PW00',
					choices: self.CHOICES_POWER
				}
			]
		},
		'disc_drive': {
			label: 'Disc Drive',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PCDTRYOP',
					choices: self.CHOICES_DISC_DRIVE
				}
			]
		},
		'track_selection': {
			label: 'Track Selection',
			options: [
                {
                    type: 'text',
                    id: 'info',
                    label: 'Information',
                    width: 12,
                    value: 'Note: “Track” refers to “Chapter” during DVD or BD playback. “Group” refers to “Title” during DVD or BD playback and “Folder” refers to USB and other media playback.'
                },
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: '2333',
					choices: self.CHOICES_TRACK_SELECTION
                },
                {
					type: 'number',
					id: 'sel_val',
					label: 'Track Number (1-2000)',
					min: 1,
					max: 2000,
					default: 1,
					required: false,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'title_selection': {
			label: 'Group/Title Selection',
			options: [
                {
                    type: 'text',
                    id: 'info',
                    label: 'Information',
                    width: 12,
                    value: 'Note: “Track” refers to “Chapter” during DVD or BD playback. “Group” refers to “Title” during DVD or BD playback and “Folder” refers to USB and other media playback.'
                },
                {
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PCGPPV',
					choices: self.CHOICES_TITLE_SELECTION
                },
                {
					type: 'number',
					id: 'sel_val',
					label: 'Title Number (1-2000)',
					min: 1,
					max: 2000,
					default: 1,
					required: false,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'track_searching': {
			label: 'Track Searching',
			options: [
                {
                    type: 'text',
                    id: 'info',
                    label: 'Information',
                    width: 12,
                    value: 'Note: “Track” refers to “Chapter” during DVD or BD playback. “Group” refers to “Title” during DVD or BD playback and “Folder” refers to USB and other media playback.'
                },
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PCSLSR',
					choices: self.CHOICES_DISC_DRIVE
				}
			]
		},
		'number_buttons': {
			label: 'Number Buttons',
			options: [
                {
					type: 'number',
					id: 'sel_val',
					label: 'Number (0-9)',
					min: 0,
					max: 9,
					default: 1,
					required: false,
					range: false,
					regex: self.REGEX_NUMBER
				}
			]
		},
		'ir_lock': {
			label: 'IR Lock/Unlock',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PCIRLK00',
					choices: self.CHOICES_IR_LOCK
				}
			]
		},
		'panel_lock': {
			label: 'Panel Lock/Unlock',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: '23KL',
					choices: self.CHOICES_PANEL_LOCK
				}
			]
		},
		'time_display': {
			label: 'Time Display',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PCTMDEL',
					choices: self.CHOICES_TIME_DISPLAY
				}
			]
		},
		'repeat': {
			label: 'Repeat',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PCRPAF',
					choices: self.CHOICES_REPEAT
				}
			]
		},
		'program_mode': {
			label: 'Program Mode',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PCPMP00',
					choices: self.CHOICES_PROGRAM_MODE
				}
			]
		},
		'random_mode': {
			label: 'Random Mode',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Type',
					default: 'S',
					choices: self.CHOICES_RANDOM_MODE_TYPE
				},
				{
					type: 'dropdown',
					id: 'sel_val',
					label: 'Mode',
					default: 'AL',
					choices: self.CHOICES_RANDOM_MODE_MODE
				}
			]
		},
		'hide_osd': {
			label: 'Hide OSD',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'DVHOSD00',
					choices: self.CHOICES_HIDE_OSD
				}
			]
		},
		'dvd_menu': {
			label: 'BD/DVD Disc Menu',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PCSU',
					choices: self.CHOICES_DVD_MENU
				}
			]
		},
		'audio_dialog': {
			label: 'Audio Dialog',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'DVADLG+',
					choices: self.CHOICES_AUDIO_DIALOG
				}
			]
		},
		'subtitles': {
			label: 'Subtitles Toggle',
		},
		'angle': {
			label: 'Adjust Video Angle',
		},
        'cursor': {
			label: 'Cursor',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PCCUSR1',
					choices: self.CHOICES_CURSOR
				}
			]
		},
		'enter': {
			label: 'Enter/Activate Menu',
		},
        'disc_tray': {
			label: 'Disc Tray',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PCDTRYOP',
					choices: self.CHOICES_DISC_TRAY
				}
			]
		},
        'video_resolution': {
			label: 'Video Resolution',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'DVVR1',
					choices: self.CHOICES_VIDEO_RESOLUTION
				}
			]
		},
        'display_info': {
			label: 'Display Bit Rate/Media Info',
		},
        'functions_color': {
			label: 'Functions/Color',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'DVFCLR1',
					choices: self.CHOICES_FUNCTIONS_COLOR
				}
			]
		},
        'pip_mode': {
			label: 'PIP Modes',
		},
        'home_menu': {
			label: 'Home Menu',
		},
        'search_speed': {
			label: 'Search Speed',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'f',
					choices: self.CHOICES_SEARCH_SPEED
				}
			]
		},
        'dvd_auto': {
			label: 'DVD/CD Auto Play',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PCAP00',
					choices: self.CHOICES_DVD_AUTO
				}
			]
		},
        'auto_resume': {
			label: 'Auto Resume',
			options: [
				{
					type: 'dropdown',
					id: 'sel_cmd',
					label: 'Option',
					default: 'PCAR00',
					choices: self.CHOICES_AUTO_RESUME
				}
			]
		},
        

	});
}

instance.prototype.action = function(action) {
	var self = this;
	var cmd;

	switch(action.action) {
		case 'power':
            cmd = action.options.sel_cmd;
            a_val = "";
			break;

        case 'disc_drive':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;
    
        case 'track_selection':
            if (action.options.sel_cmd == 'Tr') {
                cmd = action.options.sel_cmd;
                a_val = pad4(action.options.sel_val);                    
            } 
            else {
                cmd = action.options.sel_cmd;
                a_val = "";        
            }
            break;

        case 'title_selection':
            if (action.options.sel_cmd == 'PCGp') {
                cmd = action.options.sel_cmd;
                a_val = pad4(action.options.sel_val);                    
            } 
            else {
                cmd = action.options.sel_cmd;
                a_val = "";        
            }
            break;
    
        case 'track_searching':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;

        case 'number_buttons':
            cmd = 'PCTKEY';
            a_val = action.options.sel_val;
            break;

        case 'ir_lock':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;
    
        case 'panel_lock':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;

        case 'time_display':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;

        case 'repeat':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;

        case 'program_mode':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;

        case 'Random_mode':
            cmd = action.options.sel_cmd;
            a_val = action.options.sel_val;
            break;

        case 'hide_osd':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;

        case 'dvd_menu':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;
    
        case 'audio_dialog':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;

        case 'subtitles':
            cmd = 'DVSBTL1';
            a_val = "";
            break;

        case 'angle':
            cmd = 'DVANGL+';
            a_val = "";
            break;

        case 'cursor':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;

        case 'enter':
            cmd = 'PCENTR';
            a_val = "";
            break;
        
        case 'video_resolution':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;

        case 'display_info':
            cmd = 'DVDSIF';
            a_val = "";
            break;
        
        case 'functions_color':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;
    
        case 'pip_mode':
            cmd = 'DVMO';
            a_val = "";
            break;

        case 'home_menu':
            cmd = 'PCHM';
            a_val = "";
            break;

        case 'search_speed':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;

        case 'dvd_auto':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;

        case 'auto_resume':
            cmd = action.options.sel_cmd;
            a_val = "";
            break;
    }

    if (cmd !== undefined) {
        console.log('Send: @' + cmd + a_val)

        debug('sending ',"@0" + cmd + a_val,"to",self.config.host);
        if (self.socket !== undefined && self.socket.connected) {
            self.socket.send("@0" + cmd+ a_val + "\r");
        }
        else {
            debug('Socket not connected :(');
        }
    }
}

instance_skel.extendedBy(instance);
exports = module.exports = instance;