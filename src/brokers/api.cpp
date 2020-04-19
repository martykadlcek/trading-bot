/*
 * api.cpp
 *
 *  Created on: 8. 6. 2019
 *      Author: ondra
 */

#include <fstream>
#include "api.h"

#include <sys/stat.h>
#include <unordered_map>
#include <imtjson/string.h>
#include <imtjson/array.h>
#include <imtjson/object.h>
#include <shared/linear_map.h>
#include <imtjson/binjson.tcc>
#include <imtjson/binary.h>

#include "../main/istockapi.cpp"
#include "../shared/stdLogOutput.h"
using namespace json;

class BrokerLogProvider: public ondra_shared::StdLogProvider {
public:
	using ondra_shared::StdLogProvider::StdLogProvider;


	virtual ondra_shared::PLogProvider newSection(const StrViewA &ident)  override {
		return ondra_shared::PLogProvider(new BrokerLogProvider(*this,ident));
	}

	virtual void appendDate(std::time_t ) override {}
	virtual void appendThreadIdent() override {}


};


class AbstractBrokerAPI::LogProvider: public ondra_shared::StdLogProviderFactory {
public:
	using Super = ondra_shared::StdLogProviderFactory;
	LogProvider(AbstractBrokerAPI &owner):owner(owner) {}
	virtual void writeToLog(const StrViewA &line, const std::time_t &, ondra_shared::LogLevel ) override {
		if (connected) owner.logMessage(std::string(line));
	}
	void lock() {
		Super::lock.lock();
	}
	void unlock() {
		Super::lock.unlock();
	}
	void disconnect() {
		lock();
		connected = false;
		unlock();

	}

	virtual ondra_shared::PLogProvider create() override {
		return ondra_shared::PLogProvider(new BrokerLogProvider(this));
	}

protected:
	AbstractBrokerAPI &owner;
	bool connected = true;
};




static Value getBalance(AbstractBrokerAPI &handler, const Value &request) {
	Value symb = request["symbol"];
	Value pair = request["pair"];
	return handler.getBalance(symb.toString().str(), pair.toString().str());
}

static Value syncTrades(AbstractBrokerAPI &handler, const Value &request) {
	AbstractBrokerAPI::TradesSync hst(
			handler.syncTrades(
					request["lastId"],
					request["pair"].getString()));
	Array response;
	response.reserve(hst.trades.size());
	for (auto &&itm: hst.trades) {
		response.push_back(itm.toJSON());
	}
	return Object("trades",response)
				 ("lastId", hst.lastId);
}

static Value getOpenOrders(AbstractBrokerAPI &handler, const Value &request) {
	AbstractBrokerAPI::Orders ords(handler.getOpenOrders(request.getString()));

	Array response;
	response.reserve(ords.size());
	for (auto &&itm:ords) {
		response.push_back(Object
				("id",itm.id)
				("clientOrderId",itm.client_id)
				("size",itm.size)
				("price",itm.price));
	}
	return response;
}

static Value getTicker(AbstractBrokerAPI &handler, const Value &req) {
	AbstractBrokerAPI::Ticker tk(handler.getTicker(req.getString()));

	return Object
			("bid", tk.bid)
			("ask", tk.ask)
			("last", tk.last)
			("timestamp",tk.time);
}


static Value placeOrder(AbstractBrokerAPI &handler, const Value &req) {
	return handler.placeOrder(req["pair"].getString(),
			req["size"].getNumber(),
			req["price"].getNumber(),
			req["clientOrderId"],
			req["replaceOrderId"],
			req["replaceOrderSize"].getNumber());
}

static Value enableDebug(AbstractBrokerAPI &handler, const Value &req) {
	AbstractBrokerAPI *h = dynamic_cast<AbstractBrokerAPI *>(&handler);
	if (h) {
		h->enable_debug(req.getBool());
	}
	return Value();
}


static Value getBrokerInfo(AbstractBrokerAPI &handler, const Value &req) {
	AbstractBrokerAPI::BrokerInfo nfo = handler.getBrokerInfo();
	return Object("name",nfo.exchangeName)
				 ("url",nfo.exchangeUrl)
				 ("version",nfo.version)
				 ("licence",nfo.licence)
				 ("trading_enabled", nfo.trading_enabled)
				 ("settings",nfo.settings)
				 ("subaccounts",nfo.subaccounts)
				 ("favicon",Value(BinaryView(StrViewA(nfo.favicon)),base64));
}

static Value reset(AbstractBrokerAPI &handler, const Value &req) {
	handler.reset();
	return Value();
}

static Value getAllPairs(AbstractBrokerAPI &handler, const Value &req) {
	auto r = handler.getAllPairs();
	Array response;
	response.reserve(r.size());
	for (auto &&itm: r) response.push_back(itm);
	return response;
}

static Value getFees(AbstractBrokerAPI &handler, const Value &req) {
	return  handler.getFees(req.getString());
}



static Value getInfo(AbstractBrokerAPI &handler, const Value &req) {
	AbstractBrokerAPI::MarketInfo nfo ( handler.getMarketInfo(req.getString()) );
	return Object
			("asset_step",nfo.asset_step)
			("currency_step", nfo.currency_step)
			("asset_symbol",nfo.asset_symbol)
			("currency_symbol", nfo.currency_symbol)
			("min_size", nfo.min_size)
			("min_volume", nfo.min_volume)
			("fees", nfo.fees)
			("feeScheme",AbstractBrokerAPI::strFeeScheme[nfo.feeScheme])
			("leverage", nfo.leverage)
			("invert_price", nfo.invert_price)
			("inverted_symbol", nfo.inverted_symbol)
			("simulator", nfo.simulator);
}

static Value setApiKey(AbstractBrokerAPI &handler, const Value &req) {
	handler.setApiKey(req);
	return Value();
}

static Value getApiKeyFields(AbstractBrokerAPI &handler, const Value &req) {
	return handler.getApiKeyFields();
}

static Value setSettings(AbstractBrokerAPI &handler, const Value &req) {
	return handler.setSettings(req);
}
static Value restoreSettings(AbstractBrokerAPI &handler, const Value &req) {
	handler.restoreSettings(req);
	return Value();
}

static Value getSettings(AbstractBrokerAPI &handler, const Value &req) {
	return handler.getSettings(req.toString().str());
}


static Value fetchPage(AbstractBrokerAPI &handler, const Value &req) {
	AbstractBrokerAPI::PageData preq;
	preq.body = req["body"].toString().str();
	for (Value v: req["headers"]) {
		preq.headers.emplace_back(v.getKey(), v.toString().str());
	}

	auto resp = handler.fetchPage(req["method"].toString().str(),
				req["path"].toString().str(),
				preq);
	return Object("code", resp.code)
			("body", resp.body)
			("headers", Value(json::object, resp.headers.begin(), resp.headers.end(),[](auto &&p) {
					return Value(p.first, p.second);
			}));
}




Value handleSubaccount(AbstractBrokerAPI &handler, const Value &req) {
	static std::unordered_map<Value, std::unique_ptr<AbstractBrokerAPI> > subList;
	if (req.hasValue()) {
		Value id = req[0];
		Value cmd = req[1];
		StrViewA cmdstr = cmd.getString();
		Value args = req[2];
		bool loadK = false;
		if (cmdstr == "erase") {
			subList.erase(id);
			return Value();
		} else {
			auto iter = subList.find(id);
			if (iter == subList.end()) {
				std::unique_ptr<AbstractBrokerAPI> newptr(handler.createSubaccount(handler.secure_storage_path+"-"+id.toString().c_str()));
				if (newptr == nullptr) throw std::runtime_error("Subaccounts are not supported");
				iter = subList.emplace(id, std::move(newptr)).first;
				loadK = true;
			}

			auto &p = iter->second;

			class LogCleanup{
			public:
				decltype(p) z;
				LogCleanup(decltype(p) z):z(z) {}
				~LogCleanup() {z->logStream = nullptr;}
			};

			p->logStream = handler.logStream;
			LogCleanup cleanUp(p);

			p->flushMessages();
			if (loadK) p->loadKeys();
			if (cmdstr == "getBrokerInfo") {
				Value v = getBrokerInfo(*iter->second, args);
				return v.replace("subaccounts", false);
			} else if (cmdstr == "subaccount") {
				throw std::runtime_error("Can't access subaccount under subaccount");
			} else {
				Value v =  p->callMethod(cmdstr, args);
				if (v[0].getBool()) return v[1]; else throw v[1];
			}

		}
	} else {
		return Value(json::array,subList.begin(), subList.end(), [&](const auto &p) {return p.first;});
	}
}

///Handler function
using HandlerFn = Value (*)(AbstractBrokerAPI &handler, const Value &request);
using MethodMap = ondra_shared::linear_map<std::string_view, HandlerFn> ;

static MethodMap methodMap ({
			{"getBalance",&getBalance},
			{"syncTrades",&syncTrades},
			{"getOpenOrders",&getOpenOrders},
			{"getTicker",&getTicker},
			{"placeOrder",&placeOrder},
			{"reset",&reset},
			{"getAllPairs",&getAllPairs},
			{"getFees",&getFees},
			{"getInfo",&getInfo},
			{"enableDebug",&enableDebug},
			{"getBrokerInfo",&getBrokerInfo},
			{"setApiKey",&setApiKey},
			{"getApiKeyFields",&getApiKeyFields},
			{"setSettings",&setSettings},
			{"getSettings",&getSettings},
			{"restoreSettings",&restoreSettings},
			{"fetchPage",&fetchPage},
			{"subaccount",&handleSubaccount}
	});


Value AbstractBrokerAPI::callMethod(std::string_view name, Value args) {
	try {
		auto iter = methodMap.find(name);
		if (iter == methodMap.end()) throw std::runtime_error("Method not implemented");
		return {true, (*iter->second)(*this, args)};
	} catch (Value &e) {
		return {false, e};
	} catch (std::exception &e) {
		return {false, e.what()};
	}
}



void AbstractBrokerAPI::dispatch(std::istream& input, std::ostream& output, std::ostream &error, AbstractBrokerAPI &handler) {

	handler.logProvider->setDefault();
	try {
		Value v = Value::fromStream(input);
		handler.logStream = &error;
		handler.flushMessages();
		handler.loadKeys();
		handler.onInit();
		while (true) {
			handler.callMethod(v[0].getString(), v[1]).toStream(output);
			handler.logStream = nullptr;
			output << std::endl;
			int i = input.get();
			while (i != EOF && isspace(i)) i = input.get();
			if (i == EOF) break;
			input.putback(i);
			v = Value::fromStream(input);
			handler.logStream = &error;
			handler.flushMessages();
		}
	} catch (std::exception &e) {
		Value({false, e.what()}).toStream(output);
		output << std::endl;
	}
	handler.logStream = nullptr;
}

AbstractBrokerAPI::AbstractBrokerAPI(const std::string &secure_storage_path,
		const Value &apiKeyFormat)
:secure_storage_path(secure_storage_path)
,apiKeyFormat(apiKeyFormat)
,logProvider(new LogProvider(*this))
{

}
AbstractBrokerAPI::~AbstractBrokerAPI() {
logProvider->disconnect();
}

void AbstractBrokerAPI::loadKeys() {
	try {
		std::ifstream f(secure_storage_path);
		if (!f) return;
		Value key = json::Value::parseBinary([&] {
			return f.get();
		}, base64);
		onLoadApiKey(key);
	} catch (std::exception &e) {
		std::cerr << e.what();
	}
}

void AbstractBrokerAPI::dispatch() {
	dispatch(std::cin, std::cout, std::cerr, *this);
}

void AbstractBrokerAPI::setApiKey(json::Value keyData) {

	onLoadApiKey(keyData);

	umask( S_IRGRP | S_IWGRP | S_IROTH | S_IWOTH);
	std::ofstream f(secure_storage_path);
	if (!f) throw std::runtime_error("Failed to store API key");
	keyData.serializeBinary([&](char c){f.put(c);}, compressKeys);
	if (!f) throw std::runtime_error("Failed to store API key");
}

json::Value AbstractBrokerAPI::getApiKeyFields() const {
	return apiKeyFormat;
}

json::Value AbstractBrokerAPI::getSettings(const std::string_view & ) const {
	throw std::runtime_error("unsupported");
}

json::Value AbstractBrokerAPI::setSettings(json::Value) {
	throw std::runtime_error("unsupported");
}
void AbstractBrokerAPI::restoreSettings(json::Value v) {
	throw std::runtime_error("unsupported");
}

void AbstractBrokerAPI::logMessage(std::string&& msg) {
//already locked
	if (logStream) {
		(*logStream) << msg << std::endl;
	} else {
		logMessages.push_back(std::move(msg));
	}
}

void AbstractBrokerAPI::flushMessages() {
	std::lock_guard<LogProvider> _(*logProvider);
	if (logStream) {
		for (auto &&msg: logMessages)
			(*logStream) << msg << std::endl;
		logMessages.clear();
	}
}
double AbstractBrokerAPI::getBalance(const std::string_view & symb, const std::string_view & pair){
	return getBalance(symb);
}

AbstractBrokerAPI::PageData AbstractBrokerAPI::fetchPage(const std::string_view &,
		const std::string_view &, const PageData &) {
	return {};
}

void AbstractBrokerAPI::enable_debug(bool enable) {
	logProvider->setEnabledLogLevel(enable?ondra_shared::LogLevel::debug:ondra_shared::LogLevel::error);
	debug_mode = enable;
}
