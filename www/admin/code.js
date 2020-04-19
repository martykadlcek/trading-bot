"use strict";

function app_start() {
	TemplateJS.View.lightbox_class = "lightbox";
	window.app = new App();
	window.app.init();
	
}

function parse_fetch_error(e) {
	var txt;
	if (e.headers) {
		var ct = e.headers.get("Content-Type");
		if (ct == "text/html" || ct == "application/xhtml+xml") {
			txt = e.text().then(function(text) {
			 	var parser = new DOMParser();
				var htmlDocument = parser.parseFromString(text, ct);
				var el = htmlDocument.body.querySelector("p");
				if (!el) el = htmlDocument.body;
				return el.innerText;
			});
		} else {
			txt = e.text() || "";
		}
	} else {
		txt = Promise.resolve(e.toString());
	}	
	return txt.then(function(t) {
			var msg = (e.status || "")+" "+(e.statusText || "");
			if (t == msg) t = "";
			return {msg:msg, t:t};
	});
} 

function fetch_error(e) {
	if (!fetch_error.shown) {
		fetch_error.shown = true;
		parse_fetch_error(e).then(function(t) {
			if (e.status == 401) {
				var txts = document.getElementById("strtable");
				app.dlgbox({text: txts.dataset.please_login},"network_error").then(function() {
					fetch_error.shown = false;
				});
			} else {
				app.dlgbox({text:t.msg, desc:t.t},"network_error").then(function() {
					fetch_error.shown = false;
				});
			}
		});
	}
	throw e;	
}

function fetch_with_error(url, opt) {
	return fetch_json(url, opt).catch(fetch_error);
}

function App() {	
	this.traders={};
	this.config={};
	this.curForm = null;
	this.advanced = false;
}

TemplateJS.View.prototype.showWithAnim = function(item, state) {	
	var elem = this.findElements(item)[0];
	var h = elem.classList.contains("hidden") || elem.hidden;
	if (state) {
		if (h) {
			elem.hidden = false;
			TemplateJS.waitForDOMUpdate().then(function(x) {
				elem.classList.remove("hidden");
			});
		}
	} else {
		if (!h) {
			elem.classList.add("hidden");
			var anim = new TemplateJS.Animation(elem);
			anim.wait().then(function(x) {
				if (elem.classList.contains("hidden")) 
					elem.hidden = true;
			});
		}
	}
}


App.prototype.createTraderForm = function() {
	var form = TemplateJS.View.fromTemplate("trader_form");
	var norm=form.findElements("goal_norm")[0];
	var pl = form.findElements("goal_pl")[0];
	form.dlgRules = function() {
		var state = this.readData(["strategy","advanced","check_unsupp"]);
		form.showItem("strategy_halfhalf",state.strategy == "halfhalf" || state.strategy == "keepvalue");
		form.showItem("strategy_pl",state.strategy == "plfrompos");
		form.showItem("strategy_stairs",state.strategy == "stairs");
		form.showItem("strategy_hyperbolic",state.strategy == "hyperbolic");
		form.showItem("kv_valinc_h",state.strategy == "keepvalue");
		form.setData({"help_goal":{"class":state.strategy}});
		form.getRoot().classList.toggle("no_adv", !state["advanced"]);
		form.getRoot().classList.toggle("no_experimental", !state["check_unsupp"]);
		if (form.onChangeStrategy) {
			form.onChangeStrategy(state);
		}
		return state;
	};
	form.setItemEvent("strategy","change", form.dlgRules.bind(form));
	form.setItemEvent("advanced","change", form.dlgRules.bind(form));
	form.setItemEvent("check_unsupp","change", form.dlgRules.bind(form));
	return form;
}

App.prototype.createTraderList = function(form) {
	if (!form) form = TemplateJS.View.fromTemplate("trader_list");
	var items = Object.keys(this.traders).map(function(x) {
		return {
			image:this.brokerImgURL(this.traders[x].broker),
			caption: this.traders[x].title,
			broker: this.traders[x].broker,
			id: this.traders[x].id,			
		};
	},this);
	items.sort(function(a,b) {
		return a.broker.localeCompare(b.broker);
	});
	items.unshift({
		"image":"../res/options.png",
		"caption":this.strtable.options,				
		"id":"$"
		
	})
	items.unshift({
		"image":"../res/security.png",
		"caption":this.strtable.access_control,				
		"id":"!"
		
	})
	items.push({
		"image":"../res/add_icon.png",
		"caption":"",				
		"id":"+"
	});
	items.forEach(function(x) {
		x[""] = {"!click":function(id) {
			form.select(id);
		}.bind(null,x.id)}
	});
	form.setData({"item": items});
	form.select = function(id) {
		var update = items.map(function(x) {
			return {"":{"classList":{"selected": x.id == id}}};
		});
		form.setData({"item": update});
		
		var nf;
		if (id == "!") {
			if (this.curForm) {
				this.curForm.save();				
				this.curForm = null;
			}
			nf = this.securityForm();
			this.desktop.setItemValue("content", nf);
			nf.save = function() {};

		} else if (id == '$') {
			if (this.curForm) {
				this.curForm.save();				
				this.curForm = null;
			}
			nf = this.optionsForm();
			this.desktop.setItemValue("content", nf);
			this.curForm = nf;
			
		} else if (id == "+") {
			this.brokerSelect().then(this.pairSelect.bind(this)).then(function(res) {
				var broker = res[0];
				var pair = res[1];
				var name = res[2];				
				if (!this.traders[name]) this.traders[name] = {};
				var t = this.traders[name];
				t.broker = broker;
				t.pair_symbol = pair;
				t.id = name;
				t.enabled = true;
				t.dry_run = false;
				if (!t.title) t.title = pair;
				this.updateTopMenu(name);
			}.bind(this))
		} else {
			if (this.curForm) {
				this.curForm.save();				
				this.curForm = null;
			}

			nf = this.openTraderForm(id);			

			this.desktop.setItemValue("content", TemplateJS.View.fromTemplate("main_form_wait"));
			
			nf.then(function (nf) {
				this.desktop.setItemValue("content", nf);
				this.curForm = nf;
				this.curForm.save = function() {
					this.traders[id] = this.saveForm(nf, this.traders[id]);
					this.updateTopMenu();
				}.bind(this);
				this.curTrader = this.traders[id];
			}.bind(this));
		}
	}.bind(this);
	
	return form;
}

App.prototype.processConfig = function(x) {	
	this.config = x;
	this.users = x["users"] || [];
	this.traders = x["traders"] || {}
	for (var id in this.traders) this.traders[id].id = id;
	return x;	
}

App.prototype.loadConfig = function() {
	return fetch_with_error("api/config").then(this.processConfig.bind(this));
}

App.prototype.brokerURL = function(broker) {
	return "api/brokers/"+encodeURIComponent(broker);
}
App.prototype.pairURL = function(broker, pair) {
	return this.brokerURL(broker) + "/pairs/" + encodeURIComponent(pair);	
}
App.prototype.brokerImgURL = function(broker) {
	return this.brokerURL(broker) + "/icon.png";	
}
App.prototype.traderURL = function(trader) {
	return "api/traders/"+encodeURIComponent(trader);
}
App.prototype.traderPairURL = function(trader, pair) {
	return "api/traders/"+encodeURIComponent(trader)+"/broker/pairs/" + encodeURIComponent(pair);	
}

function defval(v,w) {
	if (v === undefined) return w;
	else return v;
}

function filledval(v,w) {
	if (v === undefined) return {value:w};
	else if (v == w) return {value:v};
	else {
		return {
			"value":v,
			"classList":{
				"changed":true
			}
		}
	}
}



function calc_range(a, ea, c, p, inv, leverage) {
	a = a+ea;
	var value = a * p;
	var max_price = pow2((a * Math.sqrt(p))/ea);
	var S = value - c
	var min_price = S<=0?0:pow2(S/(a*Math.sqrt(p)));
	if (leverage) {
		var colateral = c* (1 - 1 / leverage); 
		min_price = (ea*p - 2*Math.sqrt(ea*colateral*p) + colateral)/ea;
		max_price = (ea*p + 2*Math.sqrt(ea*colateral*p) + colateral)/ea;

	}
	if (!isFinite(max_price)) max_price = "∞";
	if (inv) {
		var k = 1/min_price;
		min_price = 1/max_price;
		max_price =k;
	}
	return {
		range_min_price: adjNumN(min_price),
		range_max_price: adjNumN(max_price)
	}

	
}

App.prototype.fillForm = function (src, trg) {
	var data = {};	
	data.id = src.id;
	data.title = src.title;
	data.symbol = src.pair_symbol;	
	if (!this.fillFormCache) this.fillFormCache = {} 
	
	
	var apikey = this.config.apikeys && this.config.apikeys[src.broker];
	var first_fetch = true;

	var updateHdr = function(){
		var state = fetch_json("api/editor",{
			method:"POST",
			body: JSON.stringify({
				broker: src.broker,
				trader: src.id,
				pair: src.pair_symbol
			})
		});
		state.then(function(st) {
			var data = {};
			fillHeader(st,data);
			trg.setData(data);
		},function(err) {
			var ep = parse_fetch_error(err);
			ep.then(function(x) {
				trg.setData({
					err_failed_to_fetch:{
						value:x.msg+" - "+x.t,
						classList:{
							mark:true
						}
					},
					broker:"error"
				});
			});
		});			
	}.bind(this);
	
	var fillHeader = function(state, data) {
				
	
		var broker = state.broker;
		var pair = state.pair;
		var orders = state.orders;
		this.fillFormCache[src.id] = state;

		data.broker = broker.exchangeName;
		data.no_api_key = {".hidden": !!(apikey === undefined?broker.trading_enabled:apikey)};
		data.api_key_not_saved = {".hidden": apikey === undefined || !(!broker.trading_enabled && apikey)};
		data.broker_id = broker.name;
		data.broker_ver = broker.version;
		data.asset = pair.asset_symbol;
		data.currency = pair.currency_symbol;
		data.balance_asset= adjNum(invSize(pair.asset_balance,pair.invert_price));
		data.balance_currency = adjNum(pair.currency_balance);
		data.price= adjNum(invPrice(pair.price,pair.invert_price));
		data.leverage=pair.leverage?pair.leverage+"x":"n/a";
		trg._balance = pair.currency_balance;

		var mp = orders?orders.map(function(z) {
			return {
				id: z.id,
				dir: invSize(z.size,pair.invert_price)>0?"BUY":"SELL",
				price:adjNum(invPrice(z.price, pair.invert_price)),
				size: adjNum(Math.abs(z.size))
			};}):[];

		if (mp.length) {
			var butt = document.createElement("button");
			butt.innerText="X";
			mp[0].action = {
					"rowspan":mp.length,
					"value": butt
			};
			butt.addEventListener("click", this.cancelAllOrders.bind(this, src.id));
		}
		
		data.orders = mp

		var fields = []

		function fill_recursive(path, node) {
			if (node === undefined) return;
			if (typeof node == "object") {
				if (node === null) return;
				Object.keys(node).forEach(function(k) {
					fill_recursive(path.concat(k), node[k]);
				});
			} else {
				fields.push({
					key: path.join("."),
					value: adjNumN(node)
				});
			}
		}
		if (state.strategy) fill_recursive([],state.strategy);

		data.strategy_fields = fields;
		data.icon_broker = {
					".hidden":!broker.settings,
					"!click":this.brokerConfig.bind(this, src.broker, src.pair_symbol)
				}					
		data.open_orders_sect = {".hidden":!mp.length};

		function linStrategy_recalc() {
			var fdata = {};
			var inputs = trg.readData(["max_pos","cstep","pl_posoffset"]);
			var pos = invSize(pair.asset_balance,pair.invert_price) - inputs.pl_posoffset;
			var k = inputs.cstep / (pair.price*pair.price * 0.01);
			var mp = pair.price - pos/k;
			var lp = mp-inputs.max_pos/k;
			fdata.linear_max_in_pos = adjNum(0.5*k*(mp - lp)*(mp - lp));
			var minp = -inputs.max_pos/k+mp;
			var maxp = +inputs.max_pos/k+mp;
			if (pair.invert_price) {
				fdata.linear_max_price = minp<0?"∞":adjNum(1/minp);
				fdata.linear_min_price = adjNum(1/maxp);
			} else {
				fdata.linear_min_price = adjNum(minp);
				fdata.linear_max_price = maxp<0?"∞":adjNum(maxp);				
			}
			fdata.err_toolargepos = {classList:{mark:pos > safe_pos}};
			fdata.err_invalid_values = {classList:{mark:inputs.cstep<=0 || inputs.max_pos<0}};

			trg.setData(fdata);
			var safe_pos = pair.currency_balance / pair.price;
			trg.forEachElement("err_toolargepos", function(b,x) 
				{x.classList.toggle("mark",b);}.bind(null, pos > safe_pos) );
		}
		function linStrategy_recomended() {
			var inputs = trg.readData(["cstep","pl_posoffset","pl_baluse"]);
			var value = pair.currency_balance*inputs.pl_baluse*0.01;
			var invest = value / 20;
			var k = invest / (pair.price*pair.price * 0.01);
			var max_pos = Math.sqrt(k * value);
			trg.setData({
				cstep : adjNumN(invest),
				max_pos: adjNumN(max_pos)
			});

			linStrategy_recalc();
		}
		function linStrategy_recomended_maxpos() {			
			var inputs = trg.readData(["cstep","pl_posoffset","pl_baluse"]);
			var value = pair.currency_balance*inputs.pl_baluse*0.01;
			var invest = inputs.cstep;
			var k = invest / (pair.price*pair.price * 0.01);
			var max_pos = Math.sqrt(k * value);
			trg.setData({
				max_pos: adjNumN(max_pos)
			});
			linStrategy_recalc();
		}

		function halfHalf_recalc() {
			var inputs = trg.readData(["strategy","acum_factor","external_assets"]);
			var p = pair.price;
			var ea = inputs.external_assets;
			var data = {};
			var a = pair.asset_balance+ea;
			if (inputs.strategy == "halfhalf") {				
				var s = a * p - pair.currency_balance;				
				if (pair.invert_price) {
					data.halfhalf_max_price = adjNum(s <0?"∞":p/((s/a)*(s/a)));
					data.halfhalf_min_price = ea <= 0?0:adjNum((ea*ea)/(p*a*a));
				} else {
					data.halfhalf_max_price = ea <= 0?"∞":adjNum(p*a*a/(ea*ea));
					data.halfhalf_min_price = adjNum(s <0?0:(s/a)*(s/a)/p);
				}
			} else {
				var k = p*a;
				if (pair.invert_price) {
				    data.halfhalf_min_price = ea > 0?adjNum(ea/k):0;
				    data.halfhalf_max_price = adjNum(1.0/(p*Math.exp(-pair.currency_balance/k)));
				} else {
				    data.halfhalf_min_price = adjNum(p*Math.exp(-pair.currency_balance/k));
				    data.halfhalf_max_price = ea > 0?adjNum(k/ea):"∞";
				}
			}

			data.err_external_assets = {classList:{mark:!pair.leverage && !pair.invert_price && a <= 0}};
			data.err_external_assets_margin = {classList:{mark:pair.leverage && !pair.invert_price && a <= 0}};
			data.err_external_assets_inverse = {classList:{mark:pair.invert_price && a <= 0}};
			data.external_assets_hint = -pair.asset_balance;
			trg.setData(data);
			
		}
		function linStrategy_recalc_power() {
			var v = trg.readData(["pl_power","pl_confmode","pl_baluse"]);
			if (v.pl_confmode == "m") return;
			var m = Math.pow(10,v.pl_power)*0.01;
			trg.setData({"pl_show_factor":adjNumN(m),
						"cstep":adjNumN(pair.currency_balance*m*v.pl_baluse*0.01)});
			
			linStrategy_recomended_maxpos();
		}
		
		function calcPosition(data) {
			var v = trg.readData(["pl_posoffset","report_position_offset"]);
			var cpos = invSize((isFinite(v.report_position_offset)?v.report_position_offset:0) + state.position,pair.invert_price);
			if (isFinite(cpos)) {
				var apos = invSize(pair.asset_balance, pair.invert_price) - v.pl_posoffset;
				data.hdr_position = adjNum(cpos);
				data.sync_pos = {
						".hidden":(Math.abs(cpos - apos) <= (Math.abs(cpos)+Math.abs(apos))*1e-8)
				};
			} else {
				data.hdr_position = adjNum();
				data.sync_pos = {};
			}
		}
		calcPosition(data);

		if (first_fetch) {
			data.max_pos = data.cstep = data.pl_posoffset = {"!input": linStrategy_recalc};
			data.linear_suggest = {"!click":linStrategy_recomended};
			data.linear_suggest_maxpos = {"!click":linStrategy_recomended_maxpos};
			data.external_assets = {"!input": halfHalf_recalc};
			data.vis_spread = {"!click": this.init_spreadvis.bind(this, trg, src.id), ".disabled":false};
			data.show_backtest= {"!click": this.init_backtest.bind(this, trg, src.id, src.pair_symbol, src.broker), ".disabled":false};
			linStrategy_recalc();
			halfHalf_recalc();
			linStrategy_recalc_power();
			var tmp = trg.readData(["cstep","max_pos"]);
			if (!tmp.max_pos && !tmp.cstep) linStrategy_recomended();
			data.pl_baluse = data.pl_power={"!input":function() {
				linStrategy_recalc_power();
			}};
			data.pl_confmode = {"!change":function() {
				trg.showItem("pl_mode_m", this.value == "m");
				trg.showItem("pl_mode_a", this.value == "a");
			}};
			data.sync_pos["!click"] = function() {
				var data = {};
				var v = trg.readData(["pl_posoffset","report_position_offset"]);
				var s = pair.asset_balance - invSize(v.pl_posoffset, pair.invert_price) - state.position;
				trg.setData({report_position_offset:s});
				calcPosition(data);
				trg.setData(data);
			}
			if (!pair.leverage) {
				var elm = trg.findElements("st_power")[0].querySelector("input[type=range]");
				elm.setAttribute("max","199");
			}
			first_fetch = false;
		}
		
		
	}.bind(this);
	
	if (this.fillFormCache[src.id]) {
	setTimeout(function() {
			var data= {};
			fillHeader(this.fillFormCache[src.id], data);
			trg.setData(data);
	}.bind(this),1);
	}
	data.broker_img = this.brokerImgURL(src.broker);
	data.advanced = this.advanced;

	
	data.strategy = (src.strategy && src.strategy.type) || "";
	data.cstep = 0;
	data.pl_posoffset = 0;
	data.acum_factor = 0;
	data.external_assets = 0;
	data.pl_mode_m = {".hidden":true};
	data.pl_power=1;
	data.pl_show_factor=0.1;
	data.pl_baluse=50;
	data.pl_redfact=50;
	data.pl_redmode="rp";
	data.pl_redoninc=true;
	data.kv_valinc = 0;
	data.kv_halfhalf=false;
	data.st_power={"value":1.7};
	data.st_max_step=1;
	data.st_reduction_step=2;
	data.st_pattern = "constant";
	data.st_sl=false;
	data.hp_reduction=40;
	data.hp_asym=0;
	data.hp_power=1;
	data.hp_powadj=0.5;
	data.hp_dynred=-0.05;
	data.hp_maxloss=0;

	function powerCalc(x) {return adjNumN(Math.pow(10,x)*0.01);};

	
	if (data.strategy == "halfhalf" || data.strategy == "keepvalue") {
		data.acum_factor = filledval(defval(src.strategy.accum,0)*100,0);
		data.external_assets = filledval(src.strategy.ea,0);
		data.kv_valinc = filledval(src.strategy.valinc,0);
		data.kv_halfhalf = filledval(src.strategy.halfhalf,false);
	} else if (data.strategy == "hyperbolic") {
		data.hp_reduction = filledval(defval(src.strategy.reduction,0.25)*100,25);
		data.hp_asym = filledval(defval(src.strategy.asym,0.2)*100,20);
		data.hp_maxloss = filledval(src.strategy.max_loss,0);
		data.hp_power = filledval(src.strategy.power,1);
		data.hp_powadj = filledval(src.strategy.powadj,0.5);
		data.hp_dynred = filledval(src.strategy.dynred,-0.05);
		data.hp_extbal = filledval(src.strategy.extbal,0);
	} else if (data.strategy == "stairs") {
		data.st_power = filledval(src.strategy.power,1.7);
		data.st_show_factor = powerCalc(data.st_power.value)
		data.st_max_step = filledval(src.strategy.max_steps,1);
		data.st_pattern = filledval(src.strategy.pattern,"constant");
		data.st_reduction_step= filledval(src.strategy.reduction_steps,2);
		data.st_redmode= filledval(src.strategy.redmode,"stepsBack");
		data.st_tmode=filledval(src.strategy.mode, "auto");
		data.st_sl=filledval(src.strategy.sl,false);
	} else if (data.strategy == "plfrompos") {
		data.pl_posoffset = filledval(src.strategy.pos_offset,0);		
		data.cstep = filledval(src.strategy.cstep,0);
		data.max_pos = filledval(src.strategy.maxpos,0);
		data.pl_redfact = filledval(defval(Math.abs(src.strategy.reduce_factor),0.5)*100,50);
	
		if (src.strategy.fixed_reduce) data.pl_redmode = "fixed";
		else data.pl_redmode = filledval(src.strategy.reduce_mode, "rp");		
		data.pl_baluse = filledval(defval(src.strategy.balance_use,1)*100,100);
		data.pl_confmode= filledval(src.strategy.power?"a":"m", "a");
		data.pl_power=filledval(src.strategy.power?src.strategy.power:1,1);
		data.pl_mode_m = {".hidden":!!src.strategy.power};
		data.pl_mode_a = {".hidden":!src.strategy.power};
		data.pl_show_factor=Math.pow(10,defval(src.strategy.power,1))*0.01;
		data.pl_redoninc = filledval(src.strategy.reduce_on_inc,true);
	}
	data.st_power["!change"] = function() {
		trg.setItemValue("st_show_factor",powerCalc(trg.readData(["st_power"]).st_power));
	}
	data.enabled = src.enabled;
	data.hidden = !!src.hidden;
	data.dry_run = src.dry_run;
	data.accept_loss = filledval(src.accept_loss,0);
	data.spread_calc_stdev_hours = filledval(src.spread_calc_stdev_hours,3);
	data.spread_calc_sma_hours = filledval(src.spread_calc_sma_hours,23);
	data.dynmult_raise = filledval(src.dynmult_raise,440);
	data.dynmult_fall = filledval(src.dynmult_fall, 5);
	data.dynmult_mode = filledval(src.dynmult_mode, "independent");
	data.dynmult_scale = filledval(src.dynmult_scale,false);
	data.dynmult_sliding = filledval(src.dynmult_sliding,false);
	data.dynmult_mult = filledval(src.dynmult_mult, true);
	data.spread_mult = filledval(Math.log(defval(src.buy_step_mult,1))/Math.log(2)*100,0);
	data.order_mult = filledval(defval(src.buy_mult,1)*100,100);
	data.min_size = filledval(src.min_size,0);
	data.max_size = filledval(src.max_size,0);
	data.internal_balance = filledval(src.internal_balance,0);
	data.alerts = filledval(src.alerts,true);
	data.delayed_alerts= filledval(src.delayed_alerts,false);
	data.detect_manual_trades = filledval(src.detect_manual_trades,false);
	data.report_position_offset = filledval(src.report_position_offset,0);
	data.report_order = filledval(src.report_order,0);
	data.force_spread = filledval(adjNum((Math.exp(defval(src.force_spread,0))-1)*100),"0.000");
	data.max_balance = filledval(src.max_balance,"");
	data.min_balance = filledval(src.min_balance,"");
		

	
	
	data.icon_repair={"!click": this.repairTrader.bind(this, src.id)};
	data.icon_reset={"!click": this.resetTrader.bind(this, src.id)};
	data.icon_delete={"!click": this.deleteTrader.bind(this, src.id)};
	data.icon_undo={"!click": this.undoTrader.bind(this, src.id)};
	data.icon_trading={"!click":this.tradingForm.bind(this, src.id)};
	data.icon_share={"!click":this.shareForm.bind(this, src.id, trg)};
	data.advedit = {"!click": this.editStrategyState.bind(this, src.id)};
	
	function refresh_hdr() {
		if (trg.getRoot().isConnected) {
			updateHdr();
			setTimeout(refresh_hdr,60000);
		}
	}

	function unhide_changed(x) {


		
		var root = trg.getRoot();
		var items = root.getElementsByClassName("changed");
		Array.prototype.forEach.call(items,function(x) {
			while (x && x != root) {
				x.classList.add("unhide");
				x = x.parentNode;
			}
		});

		var inputs = trg.getRoot().querySelectorAll("input,select");
		Array.prototype.forEach.call(inputs, function(x) {
			function markModified() {
				var n = this;
				while (n && n != trg.getRoot())  {
					n.classList.add("modified");
					n = n.parentNode;
				}
			}
			x.addEventListener("change", markModified );
		});	

		refresh_hdr();

		
		
		return x;
	}

	

	return trg.setData(data).catch(function(){}).then(unhide_changed.bind(this)).then(trg.dlgRules.bind(trg));
}


App.prototype.saveForm = function(form, src) {

	var data = form.readData();
	var trader = {}
	var goal = data.goal;
	trader.strategy = {};
	trader.strategy.type = data.strategy;
	if (data.strategy == "plfrompos") {
		trader.strategy.cstep = data.cstep;
		trader.strategy.pos_offset = data.pl_posoffset;
		trader.strategy.maxpos = data.max_pos;
		trader.strategy.reduce_factor = data.pl_redfact/100;
		trader.strategy.reduce_mode = data.pl_redmode;
		trader.strategy.balance_use = data.pl_baluse/100;		
		trader.strategy.power = data.pl_confmode=="a"?data.pl_power:0;
		trader.strategy.reduce_on_inc = data.pl_redoninc;
	} else if (data.strategy == "halfhalf" || data.strategy == "keepvalue") {
		trader.strategy.accum = data.acum_factor/100.0;
		trader.strategy.ea = data.external_assets;
		trader.strategy.valinc = data.kv_valinc;
		trader.strategy.halfhalf = data.kv_halfhalf;
	} else 	if (data.strategy == "hyperbolic") {
		trader.strategy = {
				type: data.strategy,
				power: data.hp_power,
				powadj: data.hp_powadj,
				dynred: data.hp_dynred,
				extbal: data.hp_extbal,
				max_loss: data.hp_maxloss,
				asym: data.hp_asym / 100,
				reduction: data.hp_reduction/100
		};
	} else 	if (data.strategy == "stairs") {
		trader.strategy ={
				type: data.strategy,
				power : data.st_power,
				max_steps: data.st_max_step,
				pattern: data.st_pattern,
				reduction_steps:data.st_reduction_step,
				redmode:data.st_redmode,
				mode:data.st_tmode,
				sl:data.st_sl
		}
	}
	trader.id = src.id;
	trader.broker =src.broker;
	trader.pair_symbol = src.pair_symbol;
	trader.title = data.title;
	trader.enabled = data.enabled;
	trader.dry_run = data.dry_run;
	trader.hidden = data.hidden;
	this.advanced = data.advanced;
	trader.accept_loss = data.accept_loss;
	trader.spread_calc_stdev_hours =data.spread_calc_stdev_hours ;
	trader.spread_calc_sma_hours  = data.spread_calc_sma_hours;
	trader.dynmult_raise = data.dynmult_raise;
	trader.dynmult_fall = data.dynmult_fall;
	trader.dynmult_mode = data.dynmult_mode;
	trader.dynmult_scale = data.dynmult_scale; 
	trader.dynmult_sliding = data.dynmult_sliding;
	trader.dynmult_mult = data.dynmult_mult;
	trader.buy_mult = data.order_mult/100;
	trader.sell_mult = data.order_mult/100;
	trader.buy_step_mult = Math.pow(2,data.spread_mult*0.01)
	trader.sell_step_mult = Math.pow(2,data.spread_mult*0.01)
	trader.min_size = data.min_size;
	trader.max_size = data.max_size;
	trader.internal_balance = data.internal_balance;
	trader.alerts = data.alerts;
	trader.delayed_alerts= data.delayed_alerts;
	trader.detect_manual_trades = data.detect_manual_trades;
	trader.report_position_offset = data.report_position_offset;
	trader.report_order = data.report_order;
	trader.force_spread = Math.log(data.force_spread/100+1);
	if (isFinite(data.min_balance)) trader.min_balance = data.min_balance;
	if (isFinite(data.max_balance)) trader.max_balance = data.max_balance;
	return trader;
	
}

App.prototype.openTraderForm = function(trader) {
	var form = this.createTraderForm();
	var p = this.fillForm(this.traders[trader], form);
	return Promise.resolve(form);	
}


App.prototype.init = function() {
	this.strtable = document.getElementById("strtable").dataset;
	this.desktop = TemplateJS.View.createPageRoot(true);
	this.desktop.loadTemplate("desktop");
	var top_panel = TemplateJS.View.fromTemplate("top_panel");
	this.top_panel = top_panel;
	this.desktop.setItemValue("top_panel", top_panel);
	top_panel.setItemEvent("save","click", this.save.bind(this));
	top_panel.setItemEvent("login","click", function() {
		location.href="api/login";
	});
	
	
	return this.loadConfig().then(function() {
		top_panel.showItem("login",false);
		top_panel.showItem("save",true);
		var menu = this.createTraderList();
		this.menu =  menu;
		this.desktop.setItemValue("menu", menu);
		this.stopped = {};
		
		
	}.bind(this));
	
}

App.prototype.brokerSelect = function() {
	var _this = this;
	return new Promise(function(ok, cancel) {
		
		var form = TemplateJS.View.fromTemplate("broker_select");
		_this.waitScreen(fetch_with_error("api/brokers/_all")).then(function(x) {
			form.openModal();
			var show_excl = false;
			var lst = x.map(function(z) {
				var e = _this.config.apikeys && _this.config.apikeys[z];
				var ex = e !== undefined || z.trading_enabled;
				show_excl = show_excl || !ex;
				return {
					excl_info: {".hidden":ex},
					image:_this.brokerImgURL(z.name),
					caption: z.name,
					"":{"!click": function() {
							form.close();
							ok(z.name);
						}}
				};
			});
			form.setData({
				"item":lst,
				"excl_info": {".hidden": !show_excl},
			});
			form.setCancelAction(function() {
				form.close();
				cancel();
			},"cancel");

		});
	});
}

App.prototype.pairSelect = function(broker) {
	var _this = this;
	return new Promise(function(ok, cancel) {
		var form = TemplateJS.View.fromTemplate("broker_pair");
		form.openModal();
		form.setCancelAction(function() {
			form.close();
			cancel();
		},"cancel");
		form.setDefaultAction(function() {
			form.close();
			var d = form.readData();
			if (!d.pair || !d.name) return;
			var name = d.name.replace(/[^-a-zA-Z0-9_.~]/g,"_");
			ok([broker, d.pair, name]);
		},"ok");
		fetch_with_error(_this.pairURL(broker,"")).then(function(data) {
			var pairs = [{"":{"value":"----",".value":""}}].concat(data["entries"].map(function(x) {
				return {"":{"value":x,".value":x}};
			}));			
			form.setItemValue("item",pairs);
			form.showItem("spinner",false);
			dlgRules();
		},function() {form.close();cancel();});
		form.setItemValue("image", _this.brokerImgURL(broker));
		var last_gen_name="";
		function dlgRules() {
			var d = form.readData(["pair","name"]);
			if (d.name == last_gen_name) {
				d.name = last_gen_name = broker+"_"+d.pair;
				form.setItemValue("name", last_gen_name);
			}
			form.enableItem("ok", d.pair != "" && d.name != "");			
		};
		
		
		form.setItemEvent("pair","change",dlgRules);
		form.setItemEvent("name","change",dlgRules);
		dlgRules();
	});
	
}

App.prototype.updateTopMenu = function(select) {
	this.createTraderList(this.menu);
	if (select) this.menu.select(select);
}

App.prototype.waitScreen = function(promise) {	
	var d = TemplateJS.View.fromTemplate('waitdlg');
	d.openModal();
	return promise.then(function(x) {
		d.close();return x;
	}, function(e) {
		d.close();throw e;
	});
}

App.prototype.cancelAllOrdersNoDlg = function(id) { 	

		var tr = this.traders[id];
		var cr = fetch_with_error(
			this.traderPairURL(id, tr.pair_symbol)+"/orders",
			{method:"DELETE"});
		var dr = fetch_json(
			this.traderURL(tr.id)+"/stop",
			{method:"POST"}).catch(function() {});


		return this.waitScreen(Promise.all([cr,dr]))
			.catch(function(){})
			.then(function() {
				this.stopped[id] = true;				
			}.bind(this));

													
}

App.prototype.deleteTrader = function(id) {
	return this.dlgbox({"text":this.strtable.askdelete},"confirm").then(function(){
			this.curForm.close();
			delete this.traders[id];
			this.updateTopMenu();
			this.curForm = null;
	}.bind(this));
}

App.prototype.undoTrader = function(id) {
	this.curForm.close();
	this.curForm = null;
	this.updateTopMenu(id);
}

App.prototype.resetTrader = function(id) {
	this.dlgbox({"text":this.strtable.askreset,
		"ok":this.strtable.yes,
		"cancel":this.strtable.no},"confirm").then(function(){

		var tr = this.traders[id];
		this.waitScreen(fetch_with_error(
			this.traderURL(tr.id)+"/reset",
			{method:"POST"})).then(function() {				
						this.updateTopMenu(tr.id);				
			}.bind(this));
	}.bind(this));
}

App.prototype.repairTrader = function(id) {
		this.dlgbox({"text":this.strtable.askrepair,
		"ok":this.strtable.yes,
		"cancel":this.strtable.no},"confirm").then(function(){

		var tr = this.traders[id];
		this.waitScreen(fetch_with_error(
			this.traderURL(tr.id)+"/repair",
			{method:"POST"})).then(function() {
						this.updateTopMenu(tr.id);				
			}.bind(this));
	}.bind(this));
}

App.prototype.cancelAllOrders = function(id) {
	return this.dlgbox({"text":this.strtable.askcancel,
		"ok":this.strtable.yes,
		"cancel":this.strtable.no},"confirm").then(this.cancelAllOrdersNoDlg.bind(this,id))
			.then(function() {
						this.updateTopMenu(id);
					}.bind(this));

}

App.prototype.addUser = function() {
	return new Promise(function(ok,cancel) {
		var dlg = TemplateJS.View.fromTemplate("add_user_dlg");
		dlg.openModal();
		dlg.setCancelAction(function(){
			dlg.close();
			cancel();
		},"cancel");
		dlg.setDefaultAction(function(){
			dlg.close();
			var data = dlg.readData();
			var dlg2 = TemplateJS.View.fromTemplate("password_dlg");
			dlg2.openModal();
			dlg2.setData(data);
			dlg2.setCancelAction(function() {
				dlg2.close();
				cancel();
			},"cancel");
			dlg2.setDefaultAction(function() {
				dlg2.unmark();
				var data2 = dlg2.readData();
				if (data2.pwd == "" ) return
				if (data2.pwd2 == "" ) {
					dlg2.findElements("pwd2")[0].focus();
					return;
				}
				if (data2.pwd  != data2.pwd2) {
					dlg2.mark("errpwd");
				} else {
					ok({
						username:data.username,
						password:data2.pwd,
						comment:data.comment
					});
					dlg2.close();
				}				
			},"ok");
		},"ok");
	});
}


App.prototype.securityForm = function() {
	var form = TemplateJS.View.fromTemplate("security_form");
	
	function dropUser(user, text){		
		this.dlgbox({"text": text+user}, "confirm").then(function() {
			this.users = this.users.filter(function(z) {
				return z.username != user;
			});
			update.call(this);
		}.bind(this));
	}
	
	
	function update() {
		
		var rows = this.users.map(function(x) {
			var that = this;
			return {
				user:x.username,
				role:{
					"value":x.admin?"admin":"viewer",
					"!change": function() {
						x.admin = this.value == "admin"
					}
				},
				comment:x.comment,
				drop:{"!click":function() {
					dropUser.call(that, x.username, this.dataset.question);
				}}
			}
		},this)
		
		function setKey(flag, broker, binfo, cfg) {
	
			if (flag) {
				fetch_with_error(this.brokerURL(broker)+"/apikey")
				.then(function(ff){
					var w = formBuilder(ff);
					w.setData(cfg);
					this.dlgbox({text:w},"confirm").then(function() {
						if (!this.config.apikeys) this.config.apikeys = {};
						this.config.apikeys[broker] = w.readData();
						form.showItem("need_save",true);
						update.call(this);
					}.bind(this));
				}.bind(this));
			} else {
				if (!this.config.apikeys) this.config.apikeys = {};
				this.config.apikeys[broker] = null;
				form.showItem("need_save",true);
				update.call(this);
				
			}
			
		}
		
		var brokers = fetch_with_error(this.brokerURL("_all")).
			then(function(x) {
				return x.map(function(binfo) {
					var z = binfo.name;
					var cfg = this.config.apikeys && this.config.apikeys[z]
					var e = cfg === undefined?binfo.trading_enabled:cfg;
					return {
						img:this.brokerImgURL(z),
						broker: z,
						exchange:  {
								value:binfo.exchangeName,
								href:binfo.exchangeUrl
							},						
						state: {
								value: e?"✓":"∅",
								classList:{set:e, notset:!e}
							},
						bset: {
								".disabled": binfo.trading_enabled && cfg === undefined,
								"!click": setKey.bind(this, true, z, binfo, cfg)
							},
						
						berase: {
								".disabled":!binfo.trading_enabled && !cfg,
								"!click": setKey.bind(this, false, z, binfo, cfg)
							},
						info_button: {
								"!click": function() {
									this.dlgbox({text:fetch_with_error(this.brokerURL(z)+"/licence")
											.then(function(t) {
												return {"value":t,class:"textdoc"};
											}),
										cancel:{".hidden":true}},"confirm")
								}.bind(this)
							},
						sub_button: {
							    "!click": function() {
                                    var dlg = TemplateJS.View.fromTemplate("subaccount_dlg");
                                    dlg.openModal();
                                    dlg.setCancelAction(function(){dlg.close();},"cancel");
                                    dlg.setDefaultAction(function(){
                                    	var d = dlg.readData();
                                    	if (d.name) {
                                    		fetch_with_error(this.brokerURL(z)+"/subaccount",{method:"POST",body:JSON.stringify(d.name)})
                                    		.then(update.bind(this))
                                    	}
                                    	dlg.close();
                                    }.bind(this),"ok");
							    }.bind(this),
							    ".hidden": !binfo.subaccounts
						}						
					}
				}.bind(this));
			}.bind(this));
			
		
		var data = {
			rows:rows,
			brokers:brokers,
			add:{
				"!click":function() {
					
					this.addUser().then(function(u) {
						var itm = this.users.find(function(z) {
							return z.username == u.username;
						});
						if (itm) itm.password = u.password;
						else this.users.push(u);
						update.call(this);
					}.bind(this));					
				}.bind(this)
				
			},
			"logout":{"!click": this.logout.bind(this)},
			guest_role:{
				"!change":function() {
					this.config.guest = form.readData(["guest_role"]).guest_role == "viewer";
				}.bind(this),
				"value": !this.config.guest?"none":"viewer"
			},
			spinner: brokers.then(function() {
				return {".hidden":true}
			})
		};
		
		form.setData(data);
		
	}
	update.call(this);
	
	return form;
}

App.prototype.dlgbox = function(data, template) {
	var dlg = TemplateJS.View.fromTemplate(template);
	dlg.openModal();
	dlg.enableItem("ok",false);
	dlg.setData(data).then(function() {
		dlg.enableItem("ok",true);
	})
	var res = new Promise(function(ok, cancel) {
		dlg.setCancelAction(function() {
			dlg.close();cancel();
		},"cancel");
		dlg.setDefaultAction(function() {
			dlg.close();ok();
		},"ok");
	});		
	res.view = dlg;
	return res;
}

App.prototype.save = function() {
	if (this.curForm) {
		this.curForm.save();
	}
	if (!this.config) {
		this.desktop.close();
		this.init();
		return;
	}
	var top = this.top_panel;
	top.showItem("saveprogress",true);
	top.showItem("saveok",false);
	this.config.users = this.users;
	this.config.traders = this.traders;
	this.validate(this.config).then(function(config) {		
		fetch_json("api/config",{
			method: "PUT",
			headers: {
				"Content-Type":"application/json",
			},
			body:JSON.stringify(config)
		}).then(function(x) {
			top.showItem("saveprogress",false);
			top.showItem("saveok",true);
			this.processConfig(x);
			this.updateTopMenu
			this.stopped = {};
		}.bind(this),function(e){			
			top.showItem("saveprogress",false);
			if (e.status == 409) {
				this.dlgbox({hdr:this.strtable.conflict1, 
							text:this.strtable.conflict2,
							ok:this.strtable.reload}, "confirm")
				.then(function() {
					location.reload();
				})
			} else {
				fetch_error(e);
			}
			
		}.bind(this));
	}.bind(this), function(e) {
		top.showItem("saveprogress",false);
		if (e.trader)   
			this.menu.select(e.trader);		
		this.dlgbox({text:e.message},"validation_error");
	}.bind(this));
}

App.prototype.logout = function() {
	this.desktop.setData({menu:"",content:""});
	this.config = null;
	fetch("api/logout").then(function(resp) {
		if (resp.status == 200) {
			location.reload();
		}
	});
}

App.prototype.validate = function(cfg) {
	return new Promise(function(ok, error) {
		var admin = cfg.users.find(function(x) {
			return x.admin;
		})
		if (!admin) return error({
				"trader":"!",
				"message":this.strtable.need_admin
			});	
		ok(cfg); 
	}.bind(this));
}


App.prototype.gen_backtest = function(form,anchor, template, inputs, updatefn) {
	var el = form.findElements(anchor)[0];
	var bt = TemplateJS.View.fromTemplate(template);
	var spinner_cnt=0;
	el.parentNode.insertBefore(bt.getRoot(),el.nextSibling);
	
	function showSpinner() {
		spinner_cnt++;
		bt.showItem("spinner",true);
	}
	function hideSpinner() {
		if (--spinner_cnt == 0)
			bt.showItem("spinner",false);
	}
	var obj = {
			showSpinner:showSpinner,
			hideSpinner:hideSpinner,
			bt:bt
	}
	function update() {
		updatefn(obj)
	}

	var tm;

	function delayUpdate() {
		if (tm) clearTimeout(tm);
		tm = setTimeout(function() {
			tm = null;
			update()},250);
	}
	obj.update = delayUpdate;

	inputs.forEach(function(a) {
		form.forEachElement(a, function(x){
			if (x.tagName == "BUTTON")
				x.addEventListener("click", delayUpdate);
			else {
				x.addEventListener("input",delayUpdate);
				x.addEventListener("change",delayUpdate);
			}
		})
	});
	update();
}

App.prototype.init_spreadvis = function(form, id) {
	var url = "api/spread"
	form.enableItem("vis_spread",false);
	var inputs = ["spread_calc_stdev_hours", "spread_calc_sma_hours","spread_mult","dynmult_raise","dynmult_fall","dynmult_mode","dynmult_sliding","dynmult_mult"];
	this.gen_backtest(form,"spread_vis_anchor", "spread_vis",inputs,function(cntr){

		cntr.showSpinner();
		var data = form.readData(inputs);
		var mult = Math.pow(2,data.spread_mult*0.01);
		var req = {
			sma:data.spread_calc_sma_hours,
			stdev:data.spread_calc_stdev_hours,
			mult:mult,
			raise:data.dynmult_raise,
			fall:data.dynmult_fall,
			mode:data.dynmult_mode,
			sliding:data.dynmult_sliding,
			dyn_mult:data.dynmult_mult,
			id: id
		}
		
		fetch_with_error(url, {method:"POST", body:JSON.stringify(req)}).then(function(v) {			
			var c = v.chart.map(function(x) {
				x.achg = x.s;
				x.time = x.t;
				return x;
			})
			if (c.length == 0) return;

			var chart1 = cntr.bt.findElements('chart1')[0];
			var interval = c[c.length-1].time-c[0].time;
			var drawChart = initChart(interval,4,700000);

			drawChart(chart1,c,"p",[],"l", "h");
		}).then(cntr.hideSpinner,cntr.hideSpinner);
		
		
	}.bind(this));
}

function createCSV(chart) {
	"use strict";
	
	function makeRow(row) {
		var s = JSON.stringify(row);
		return s.substr(1,s.length-2);
	}
	
	var rows = chart.map(function(rw){
		return makeRow([
			(new Date(rw.tm)).toJSON(),
			rw.pr,
			rw.sz,
			rw.ps,
			rw.pl,
			rw.npl,
			rw.na,
			rw.np,
			rw.op,
		]);
	})
	
	rows.unshift(makeRow([
			"time",
			"price",
			"size",
			"position",
			"profit/loss",
			"normalized profit",
			"accumulation",
			"neutral price",
			"open price",
		]));
	return rows.join("\r\n");
}

var fill_atprice=true;
var show_op=false;


App.prototype.init_backtest = function(form, id, pair, broker) {
	var url = "api/backtest";
	form.enableItem("show_backtest",false);		
	var inputs = ["external_assets", "acum_factor","kv_valinc","kv_halfhalf","pl_confmode","pl_power","pl_baluse","cstep",
		"max_pos","pl_posoffset","pl_redmode","pl_redfact","min_size","max_size","order_mult","alerts","delayed_alerts","linear_suggest","linear_suggest_maxpos","pl_redoninc",
		"st_power","st_reduction_step","st_sl","st_redmode","st_max_step","st_pattern","dynmult_sliding","accept_loss","spread_calc_sma_hours","st_tmode",
		"hp_power","hp_maxloss","hp_asym","hp_reduction","hp_extbal","hp_powadj","hp_dynred"
		];
	var spread_inputs = ["spread_calc_stdev_hours", "spread_calc_sma_hours","spread_mult","dynmult_raise","dynmult_fall","dynmult_mode","dynmult_sliding","dynmult_mult"];
	var balance = form._balance;
	var days = 45*60*60*24*1000;
    var offset = 0;
    var offset_max = 0;
	var start_date = "";
    var show_norm=this.traders[id].strategy.type == "halfhalf" || this.traders[id].strategy.type == "keepvalue"; 

	function draw(cntr, v, offset, balance) {

        var vlast = v[v.length-1];
		var interval = vlast.tm-v[0].tm;	
		offset_max = interval - days;
		if (offset_max < 0) offset_max = 0;
		var imin = vlast.tm - offset - days;
		var imax = vlast.tm - offset;
		var max_pos = 0;
		var min_pl = 0;
		var max_pl = 0;		
		var max_downdraw = 0;
		var cost = 0;
		var max_cost = 0;
		var trades = 0;
		var buys = 0;
		var sells = 0;
		var alerts = -1;
		var ascents = 0;
		var descents = 0;
		var max_streak = 0;
		var cur_streak = 0;
		var last_dir = 0;
		var lastp = v[0].pr;

		var c = [];
		var ilst,acp = false;
		v.forEach(function(x) {
			var nacp = x.tm >= imin && x.tm <=imax;
			if (nacp || acp) {
				x.achg = x.sz;
				x.time = x.tm;
				if (ilst) {
				    c.push(ilst);
					ilst = null;
				}
				c.push(x);				
			} else {
				ilst = x;
			}				
			acp = nacp;
			if (balance!==undefined) {
				var ap = Math.abs(x.ps);
				if (ap > max_pos) 
				    max_pos = ap;
				if (x.pl > max_pl) {max_pl = x.pl;min_pl = x.pl;}
				if (x.pl < min_pl) {min_pl = x.pl;var downdraw = max_pl - min_pl; if (downdraw> max_downdraw) max_downdraw = downdraw;}
				cost = cost + x.sz * x.pr;
				if (cost > max_cost) max_cost = cost;
				if (x.sz > 0) buys++;
				if (x.sz < 0) sells++;
				if (x.sz == 0) alerts++; else trades++;
				var dir = Math.sign(x.pr - lastp);
				lastp = x.pr;
				if (dir != last_dir) {
					if (cur_streak > max_streak) max_streak = cur_streak;
					cur_streak = 1;
					last_dir = dir;
				} else {
					cur_streak++;
				}
				if (dir > 0) ascents++;
				if (dir < 0) descents++;
			}
		});
		if (cur_streak > max_streak) max_streak = cur_streak;


        
		var last = c[c.length-1];
		var lastnp;
		var lastnpl;
		var lastop;
		var lastpl;
		if (offset) {
			var x = Object.assign({}, last);
			x.time = imax;
			lastnp = x.np;
			lastnpl = x.npla;
			lastop = x.op;
			lastpl = x.pl;
			c.push(x);
		}

		if (balance!==undefined) {
        cntr.bt.setData({
        	"pl":adjNumBuySell(vlast.pl),
        	"ply":adjNumBuySell(vlast.pl*31536000000/interval),
        	"npl":adjNumBuySell(vlast.npla),
        	"nply":adjNumBuySell(vlast.npla*31536000000/interval),
        	"max_pos":adjNum(max_pos),
        	"max_cost":adjNum(max_cost),
        	"max_loss":adjNumBuySell(-max_downdraw),
        	"max_loss_pc":adjNum(max_downdraw/balance*100,0),
        	"max_profit":adjNumBuySell(max_pl),
        	"pr": adjNum(max_pl/max_downdraw),
        	"pc": adjNumBuySell(vlast.pl*3153600000000/(interval*balance),0),
        	"npc": adjNumBuySell(vlast.npla*3153600000000/(interval*balance),1),
        	"showpl":{".hidden":show_norm},
        	"shownorm":{".hidden":!show_norm},
        	"trades": trades,
        	"buys": buys,
        	"sells": sells,
        	"alerts": alerts,
        	"ascents": ascents,
        	"descents": descents,
        	"streak": max_streak        
        });
		}

		var chart1 = cntr.bt.findElements('chart1')[0];
		var chart2 = cntr.bt.findElements('chart2')[0];
		if (interval > days) interval = days;
		var ratio = 4;		
		var scale = 900000;
		var drawChart = initChart(interval,ratio,scale);
		if (show_op) {
		    drawChart(chart1,c,"pr",[{label:"open",pr:lastop}],"op");
		} else {
		    drawChart(chart1,c,"pr",[{label:"neutral",pr:lastnp}],"np");			
		}
		if (show_norm)
		    drawChart(chart2,c,"npla",[{label:"PL",npla:lastpl}],"pl");
		else
		    drawChart(chart2,c,"pl",[{label:"norm",pl:lastnpl}],"npla");
	}


	var frst = true;

	var update;
	var update_recalc;
	var tm;
	var config;
	var opts
	var bal;
	var req;
	var res_data;	

	function swapshowpl() {
		show_norm = !show_norm;
		update_recalc();
	}

	function progress_wait() {		
		var dlg = TemplateJS.View.fromTemplate("upload_chart_wait");
		dlg.openModal();
		function wait(cb) {
			fetch_with_error("api/upload_prices").then(function(x) {
				if (x == -1) {
					dlg.close();
					cb();
				} 
				else {
					dlg.setData({progress:{"style":"width: "+x+"%"}});
					setTimeout(wait.bind(null,cb),1000);
				}
			}).catch(function() {
					setTimeout(wait.bind(null,cb),1000);										
			});
		}
		dlg.wait = function() {
			dlg.showItem("upload_mark",false);
			dlg.showItem("process_mark",true);
			return new Promise(wait);
		}
		dlg.setItemEvent("stop","click", function() {
			fetch_json("api/upload_prices", {method:"DELETE"});
		});
		return dlg;		
	}

	function recalc_spread(prices, cntr) {
		var data = form.readData(spread_inputs);
		var mult = Math.pow(2,data.spread_mult*0.01);
		var req = {
			sma:data.spread_calc_sma_hours,
			stdev:data.spread_calc_stdev_hours,
			mult:mult,
			raise:data.dynmult_raise,
			fall:data.dynmult_fall,
			mode:data.dynmult_mode,
			sliding:data.dynmult_sliding,
			dyn_mult:data.dynmult_mult,
			id: id,
			prices: prices
		}
		var w = progress_wait();
		fetch_with_error("api/upload_prices", {method:"POST", body:JSON.stringify(req)}).then(function(){							
			w.wait().then(cntr.update.bind(cntr));
		}).catch(function(e) {
			w.close();
			console.error(e);
		});								
	}
	
	function upload_trades(data, cntr) {
		var req = {
			id: id,
			prices: data
		}
		cntr.showSpinner();
		fetch_with_error("api/upload_trades", {method:"POST", body:JSON.stringify(req)}).then(function(){							
			cntr.update();
			cntr.hideSpinner();
		}).catch(function(e) {
			console.error(e);
			cntr.hideSpinner();
		});										
	}
	
	var import_error = function() {
		this.dlgbox({text:this.strtable.import_invalid_format,cancel:{".hidden":true}},"confirm");		
	}.bind(this);
	
	this.gen_backtest(form,"backtest_anchor", "backtest_vis",inputs,function(cntr){

		cntr.showSpinner();
		config = this.saveForm(form,{});
         opts = cntr.bt.readData(["initial_balance", "initial_pos"]);
		config.broker = broker;
		config.pair_symbol = pair;
		bal = isFinite(opts.initial_balance)?opts.initial_balance:balance;
		req = {
			config: config,
			id: id,
			init_pos:isFinite(opts.initial_pos)?opts.initial_pos:0,
			balance:bal,
			fill_atprice:fill_atprice,
			start_date: start_date
		};


		if (frst) {
			frst = false;
			cntr.bt.setItemEvent("options", "click", function() {
				this.classList.toggle("sel");
				cntr.bt.showItem("options_form", this.classList.contains("sel"));
			});
			cntr.bt.setItemEvent("initial_balance","input",cntr.update);
			cntr.bt.setItemEvent("initial_pos","input",cntr.update);
			cntr.bt.setItemValue("show_op", show_op);
			cntr.bt.setItemValue("fill_atprice",fill_atprice);
			cntr.bt.setItemEvent("show_op","change", function() {
				show_op = cntr.bt.readData(["show_op"]).show_op;
				update();
			})
			cntr.bt.setItemEvent("start_date","input", function() {
				start_date=this.valueAsNumber;
				cntr.update();
			})
			cntr.bt.setItemEvent("fill_atprice","change", function() {
				fill_atprice = cntr.bt.readData(["fill_atprice"]).fill_atprice;
				cntr.update();
			})
			cntr.bt.setItemEvent("showpl","click",swapshowpl);
			cntr.bt.setItemEvent("shownorm","click",swapshowpl);
			cntr.bt.setItemEvent("select_file","click",function(){
				var el = cntr.bt.findElements("price_file")[0];
				el.value="";
				el.click();
			});
			cntr.bt.setItemEvent("export","click",function() {
				doDownlaodFile(createCSV(res_data),id+".csv","text/plain");
			})			
			cntr.bt.setItemEvent("price_file","change",function() {
				if (this.files[0]) {
					var reader = new FileReader();
					var mode = this.dataset.mode;
					reader.onload = function() {
						var min=0;
						var trs=0;
						var prices = reader.result.split("\n").map(function(x) {
							var jr = "["+x+"]";
							try {
								var rowdata = JSON.parse(jr);
								if (rowdata.length == 1) {
									min++;										
									var out = typeof rowdata[0] == "number"?rowdata[0]:parseFloat(rowdata[0]);
									return isFinite(out)?out:null;
								} else if (rowdata.length > 1) {
									trs++;
									var out = [(new Date(rowdata[0]))*1, (typeof rowdata[1] == "string"?parseFloat(rowdata[1]):rowdata[1])];
									return isFinite(out[1])?out:null;
								} else {
									return null;
								}
							} catch(e) {
								return null;
							}
						}).filter(function(x) {return x !== null});
						if (min > trs && trs/min < 0.1) recalc_spread(prices,cntr);
						else if (min < trs && min/trs < 0.1) upload_trades(prices, cntr);
						else import_error();
					}.bind(this);
					reader.readAsText(this.files[0]);
				}
			});
			cntr.bt.setItemEvent("icon_internal","click",function(){
				recalc_spread("internal",cntr);
			})
			cntr.bt.setItemEvent("icon_recalc","click",function(){
				recalc_spread("update",cntr);
			})
			cntr.bt.setItemEvent("icon_reset","click",function(){
				fetch_json("api/backtest", {method:"DELETE"}).then(cntr.update.bind(cntr));
			})
			

			cntr.bt.setItemEvent("pos","input",function() {
				var v = -this.value;
				offset = v * offset_max/100;
				if (update) update();
			})

		}
		fetch_with_error(url, {method:"POST", body:JSON.stringify(req)}).then(function(v) {					    
			if (v.length == 0) return;
			res_data = v;
			draw(cntr,v,offset,bal);			
			update = function() {
				if (tm) clearTimeout(tm);
				tm = setTimeout(draw.bind(this,cntr,v,offset), 1);
			}
			update_recalc = draw.bind(this,cntr,v,offset,bal);
		}).then(cntr.hideSpinner,function(e){
			cntr.hideSpinner();throw e;
		});
		

        
		
	}.bind(this));
}

App.prototype.optionsForm = function() {
	var form = TemplateJS.View.fromTemplate("options_form");
	var data = {
			report_interval: defval(this.config.report_interval,864000000)/86400000,
			backtest_interval: defval(this.config.backtest_interval,864000000)/86400000,
			stop:{"!click": function() {
					this.waitScreen(fetch_with_error("api/stop",{"method":"POST"}));
					for (var x in this.traders) this.stopped[x] = true;
			}.bind(this)},
			reload_brokers:{"!click":function() {
				this.waitScreen(fetch_with_error("api/brokers/_reload",{"method":"POST"}));
			}.bind(this)}
			
	};
	form.setData(data);
	form.save = function() {
		var data = form.readData();
		this.config.report_interval = data.report_interval*86400000;
		this.config.backtest_interval = data.backtest_interval*86400000;
	}.bind(this);
	return form;
	
}

App.prototype.tradingForm = function(id) {
	if (this.curForm && this.curForm.save) {
		this.curForm.save();
	}
	this.curForm = null;
	var _this = this;
	var cfg = this.traders[id];
	if (!cfg) return;
	
	
	var form = TemplateJS.View.fromTemplate("trading_form");
	this.desktop.setItemValue("content", form);
	
	function dialogRules() {
		var data = form.readData(["order_size","order_price","edit_order"]);				
		var p = !!data.order_price;
		var q = !!data.order_size;
		form.showItem("button_buy",p);
		form.showItem("button_sell",p);
		form.showItem("button_buybid",!p);
		form.showItem("button_sellask",!p);
		form.enableItem("button_buy",q);
		form.enableItem("button_sell",q);
		form.enableItem("button_buybid",q);
		form.enableItem("button_sellask",q);
	} 
	
	form.setItemEvent("order_price","input",dialogRules);
	form.setItemEvent("order_size","input",dialogRules);
	form.setItemEvent("edit_order","change",dialogRules);
	dialogRules();
		
	function update() {		
		var traderURL = _this.traderURL(id);
		var f = fetch_json(traderURL+"/trading").then(function(rs) {
				var pair = rs.pair;
				var chartData = rs.chart;
				var trades = rs.trades;
				var orders = rs.orders;
				var ticker = rs.ticker;
				var invp = function(x) {return pair.invert_price?1/x:x;}
				var invs = function(x) {return pair.invert_price?-x:x;}				
				var now = Date.now();
				var skip = true;
				chartData.push(ticker);
				trades.unshift({
					time: chartData[0].time-100000,
					price: chartData[0].last
				});
				
				var drawChart = initChart(chartData[chartData.length-1].time - chartData[0].time);
				var data = mergeArrays(chartData, trades, function(a,b) {
					return a.time - b.time
				},function(n, k, f, t) {
					var p1;
					var p2;
					var achg;
					if (n == 0) {
						if (f != null && t != null) {
							p2 = invp(interpolate(f.time, t.time, k.time, f.price, t.price));
							if (f.time == k.time) achg = invs(t.size);
						} else if (f != null) {
							p2 = invp(f.price);
						}
						p1 = invp(k.last);
						skip = false;
						
					} else {
						if (skip) return null;						
						p1 = p2 = invp(k.price);
						achg = invs(k.size);
					} 
					return {
						time: k.time,
						p1:p1,
						p2:p2,
						achg: achg
					}
				}).filter(function(x) {return x != null;});
				
				var lines = [];
				orders.forEach(function(x) {
					var sz = invs(x.size);
					var l = sz < 0?_this.strtable.sell:_this.strtable.buy
					lines.push({
						p1: invp(x.price),
						label: l+" "+Math.abs(sz)+" @",
						class: sz < 0?"sell":"buy"
					});
				});
				form.findElements("chart").forEach(function(elem) {
					drawChart(elem, data, "p1",lines,"p2" );
				})			
				var formdata = {};
				if (pair.invert_price) {
					formdata.ask_price = adjNumN(1/ticker.bid);
					formdata.bid_price = adjNumN(1/ticker.ask);					
				} else {
					formdata.ask_price = adjNumN(ticker.ask);
					formdata.bid_price = adjNumN(ticker.bid);										
				}
				formdata.bal_assets = adjNumN(invs(pair.asset_balance)) + " "+pair.asset_symbol;
				formdata.bal_currency = adjNumN(pair.currency_balance) + " "+pair.currency_symbol;
				formdata.last_price = adjNumN(invp(ticker.last));
				var orderMap  = orders.map(function(x) {
					return {"":{
						".value":JSON.stringify(x.id),
						"value":(invs(x.size)<0?_this.strtable.sell:_this.strtable.buy) 
								+ " " + adjNumN(Math.abs(x.size))
								+" @ " + adjNumN(invp(x.price))
					}}
				});
				formdata.orders = orders.map(function(x) {
					return {id:x.id,
						dir:invs(x.size)<0?_this.strtable.sell:_this.strtable.buy,
						size:adjNumN(Math.abs(x.size)),
						price:adjNumN(invp(x.price)),
						cancel:{
							"!click":function(ev) {
								ev.stopPropagation();
								this.hidden = true;
								this.nextSibling.hidden = false;
								_this.cancelOrder(cfg.id, cfg.pair_symbol, x.id).
									then(update);
							},
							".hidden":false
						
						},
						"spinner":{
							".hidden":true
						},
						"":{
							"!click":function() {
								form.setData({
									edit_orders: orderMap,
									edit_order: JSON.stringify(x.id),
									order_size: adjNumN(Math.abs(x.size)),
									order_price: adjNumN(invp(x.price)),
								});
								dialogRules();
							}
						}
					}
				});
				var cur_edit = form.readData(["edit_order"]);
				if (cur_edit.edit_order == "") {
					formdata.edit_orders=orderMap;
					formdata.edit_order = {
							"!change": function() {
								if (this.value=="") {
									form.setData({
										"order_size":"",
										"order_price":""
									});
								} else {								
									var itm = orders.find(function(x) {
										return this.value == JSON.stringify(x.id);
									}.bind(this));
									if (itm) form.setData({
										order_size: adjNumN(Math.abs(itm.size)),
										order_price: adjNumN(invp(itm.price))
									});
								}
								dialogRules();
							}
					}
				}
				
				form.setData(formdata);
				return rs;
			})
			
		return f;
	}
	function cycle_update() {
		if (!form.getRoot().isConnected) return;
		setTimeout(cycle_update, 15000);
		return update();
	}
	
	function clearForm() {
		form.setData({
			"order_size":"",
			"order_price":"",
			"edit_order":""
		});
		dialogRules();
	}
	
	
	cycle_update().then(function(f) {
		var pair = f.pair;

		function postOrder() {
			if (!_this.stopped[id] && cfg.enable) {
				_this.dlgbox({text:_this.strtable.trade_ask_stop},"confirm")
					.then(function() {
						return _this.waitScreen(fetch_with_error(_this.traderURL(cfg.id)+"/stop",{method:"POST"}));
					}).then(function() {
						_this.stopped[id] = true;
						postOrder.call(this);
					}.bind(this));
				return;
			}

			var b = this.dataset.name;
			var d = form.readData(["edit_order","order_price","order_size"]);

			var price = b == "button_buybid"?(pair.invert_price?"ask":"bid")
						:(b == "button_sellask"?(pair.invert_price?"bid":"ask"):
								(pair.invert_price?1/d.order_price:d.order_price));
			var size = ((b == "button_buybid" || b == "button_buy") == pair.invert_price?-1:1)*d.order_size;	
			var id;
			if (d.edit_order) id = JSON.parse(d.edit_order);
			var url = _this.traderPairURL(cfg.id, cfg.pair_symbol)+"/orders";
			var req = {
					size: size,
					price: price,
					replaceId: id,
					replaceSize: 0
			};
			clearForm();
			_this.waitScreen(fetch_with_error(url, {method:"POST", body: JSON.stringify(req)}).then(update));
		}

		form.setItemEvent("button_buy","click", postOrder);
		form.setItemEvent("button_sell", "click",postOrder);
		form.setItemEvent("button_buybid", "click",postOrder);
		form.setItemEvent("button_sellask", "click",postOrder);
	}).catch(fetch_error);
} 

App.prototype.cancelOrder = function(trader, pair, id) {
	var url = this.traderPairURL(trader, pair)+"/orders"
	var req = {
			size:0,
			price:0,
			replaceId: id,
			replaceSize: 0,			
	};
	return fetch_with_error(url,{method:"POST",body: JSON.stringify(req)});
}

App.prototype.brokerConfig = function(id, pair) {
	var burl = this.pairURL(id, pair)+"/settings";
	var form = fetch_with_error(burl).then(formBuilder);
	return this.dlgbox({form:form}, "broker_options_dlg").then(function() {
		form.then(function(f) {
			var d = f.readData();
			return fetch_with_error(burl, {method:"PUT",body:JSON.stringify(d)});				
		}.bind(this))
	}.bind(this))
}

App.prototype.shareForm = function(id, form) {
	var cfg = this.saveForm(form, {});
	delete cfg.title;
	delete cfg.enable;
	delete cfg.dry_run;
	delete cfg.report_position_offset;
	delete cfg.report_order;
	delete cfg.hidden;
	var cfgstr = JSON.stringify(cfg);	
	var splt = "{{"+btoa(cfgstr).match(/.{1,24}/g).join(" ")+"}}";	
	var p = this.dlgbox({share_input:splt},"share_dlg");
	var dlg = p.view;
	var shelm = dlg.findElements("share_input")[0];
	shelm.readOnly=true;
	dlg.showItem("ok", false);
	dlg.showItem("paste", false)
	dlg.setItemEvent("import","click",function(){
		dlg.setItemValue("share_input","");
		dlg.showItem("ok", true);
		dlg.showItem("import", false);
		dlg.showItem("paste", true);
		dlg.showItem("copy", false);		
		shelm.readOnly=false;
		shelm.focus();
	});
	dlg.setItemEvent("copy","click",function(){
			shelm.focus();
			shelm.select();
			document.execCommand("copy");
	});
	dlg.setItemEvent("paste","click",function(){
		if (navigator.clipboard && navigator.clipboard.readText) {
			navigator.clipboard.readText().then(function(x){
				shelm.value = x;
			});			
		} else {
			shelm.focus();
			shelm.select();			
			document.execCommand("paste");
		}
	});
	p.then(function(){
		var txt = shelm.value;	
		txt = txt.trim();
		if (txt.startsWith("{{") && txt.endsWith("}}")) {
			txt = txt.substr(2,txt.length-4);
			txt = txt.split(/\s+/).join("");
			var json = atob(txt);
			try {
				var newcfg = JSON.parse(json);
				this.traders[id] = Object.assign(this.traders[id], newcfg);
				this.undoTrader(id);
				return;
			} catch (e) {
				
			}
		}
		this.dlgbox({"text":this.strtable.import_failed,"cancel":{hidden:true}},"confirm");
	}.bind(this));
}

App.prototype.editStrategyState = function(id) {
	var url = this.traderURL(id)+"/strategy";
	this.waitScreen(fetch_with_error(url)).then(function(data){
		var dlg = TemplateJS.View.fromTemplate("advedit_dlg");
		dlg.setData({"json_data":JSON.stringify(data,null,"  ")});
		dlg.openModal();		
		dlg.setCancelAction(function(){
			dlg.close();
		},"cancel");
		dlg.setDefaultAction(function(){
			var data = dlg.readData().json_data;
			var vald = JSON.parse(data);
			this.waitScreen(fetch_with_error(url,{"method":"PUT","body":data}))
			 .then(function() {
				dlg.close();
				this.undoTrader(id);
			 }.bind(this));
		}.bind(this),"ok");
	}.bind(this));
}