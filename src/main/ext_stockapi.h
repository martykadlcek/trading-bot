/*
 * ext_stockapi.h - external stock api
 *
 *  Created on: 21. 5. 2019
 *      Author: ondra
 */

#ifndef SRC_MAIN_EXT_STOCKAPI_H_
#define SRC_MAIN_EXT_STOCKAPI_H_

#include "istockapi.h"
#include "abstractExtern.h"
#include "apikeys.h"
#include "ibrokercontrol.h"



class ExtStockApi: public IStockApi, public IApiKey, public IBrokerControl, public IBrokerIcon, public IBrokerSubaccounts {
public:

	ExtStockApi(const std::string_view & workingDir, const std::string_view & name, const std::string_view & cmdline, int timeout);




	virtual double getBalance(const std::string_view & symb, const std::string_view & pair) override;
	virtual TradesSync syncTrades(json::Value lastId, const std::string_view & pair) override;
	virtual Orders getOpenOrders(const std::string_view & par) override;
	virtual Ticker getTicker(const std::string_view & piar) override;
	virtual json::Value placeOrder(const std::string_view & pair,
			double size, double price,json::Value clientId,
			json::Value replaceId,double replaceSize) override;
	virtual bool reset() override;
	virtual MarketInfo getMarketInfo(const std::string_view & pair) override;
	virtual double getFees(const std::string_view & pair) override;
	virtual std::vector<std::string> getAllPairs() override;
	virtual void testBroker() override {connection->preload();}
	virtual BrokerInfo getBrokerInfo()  override;
	virtual void setApiKey(json::Value keyData) override;
	virtual json::Value getApiKeyFields() const override;
	virtual json::Value getSettings(const std::string_view & pairHint) const override;
	virtual json::Value setSettings(json::Value v) override;
	virtual void restoreSettings(json::Value v) override;
	virtual void saveIconToDisk(const std::string &path) const override;
	virtual std::string getIconName() const override;
	virtual PageData fetchPage(const std::string_view &method, const std::string_view &vpath, const PageData &pageData) override;
	virtual json::Value requestExchange(json::String name, json::Value args,  bool idle = false);
	void stop();
	virtual ExtStockApi *createSubaccount(const std::string &subaccount) const override;
	virtual bool isSubaccount() const override;



protected:
	class Connection: public AbstractExtern {
	public:
		using AbstractExtern::AbstractExtern;
		virtual void onConnect() override;
		bool wasRestarted(int &counter);
		const std::string &getName() const {return this->name;}
		std::recursive_mutex &getLock() const {return lock;}
		bool isActive() const {return this->chldid != -1;}
	protected:
		std::atomic<int> instance_counter = 0;
	};

	json::Value broker_config;
	std::shared_ptr<Connection> connection;
	int instance_counter = 0;
	std::string subaccount;

	ExtStockApi(std::shared_ptr<Connection> connection, const std::string &subaccid);
};





#endif /* SRC_MAIN_EXT_STOCKAPI_H_ */
