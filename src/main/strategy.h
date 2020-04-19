/*
 * strategy.h
 *
 *  Created on: 17. 10. 2019
 *      Author: ondra
 */

#ifndef SRC_MAIN_STRATEGY_H_
#define SRC_MAIN_STRATEGY_H_

#include "../shared/ini_config.h"
#include "istrategy.h"

class Strategy {
public:

	using Ptr = PStrategy;
	using TradeResult = IStrategy::OnTradeResult;
	using MinMax = IStrategy::MinMax;
	using OrderData = IStrategy::OrderData;

	Strategy(const Ptr ptr):ptr(ptr) {}
	///Returns true, if the strategi is valid and initialized
	/**
	 * @retval true valid
	 * @retval false not valid
	 */
	bool isValid() const {return ptr!=nullptr && ptr->isValid();}
	///Called on each cycle, after status of the market is read but when there were no trades created
	/**
	 * @param minfo market info
	 * @param curPrice current market ticker
	 * @param assets asset balance
	 * @param currency currency balance
	 */
	void onIdle(const IStockApi::MarketInfo &minfo, const IStockApi::Ticker &curTicker, double assets, double currency) {
		ptr = ptr->onIdle(minfo, curTicker, assets, currency);
	}
	///Called on each cycle when trade has been created
	/**
	 * @param minfo markey info
	 * @param tradePrice price of trade (fee substracted)
	 * @param tradeSize size of the trade (fee substracted). If this field is 0, then
	 *   the trade is result of the function "accept loss". In this case, the strategy
	 *   should reset itself to unblock trading, because there is not enough assets
	 *   or currencies on the account
	 * @param assetsLeft remain assets on account
	 * @param currencyLeft remain currency on account
	 * @return The strategy must calculate normalized profit and normalized accumulated assets
	 */
	TradeResult onTrade(const IStockApi::MarketInfo &minfo, double tradePrice, double tradeSize,
			double assetsLeft, double currencyLeft)  {
		auto t = ptr->onTrade(minfo, tradePrice, tradeSize, assetsLeft, currencyLeft);
		ptr = t.second;
		return t.first;
	}

	///Exports internal state to JSON
	json::Value exportState() const;

	///Imports internal state from JSON
	void importState(json::Value src);

	///Requests the strategy to calculate order
	/**
	 * Function called twice for buy and sell order.
	 *
	 * @param minfo market info
	 * @param cur_price current price (from ticker). It defines limit how the price can be changed
	 * @param new_price new price of the order
	 * @param assets remain assets on account
	 * @param currency remain currency on account
	 * @param dir specified expected direction. +1 = buy, -1 = sell. If the strategy generates
	 * oposite direction, the next behaviour depends on the option "dust orders". If this
	 * option is turned on, a dust order is issued instead atd given price. If the option is turned off no order is issued
	 * @return data used to create new order
	 */
	OrderData getNewOrder(const IStockApi::MarketInfo &minfo, double cur_price, double new_price, double dir, double assets, double currency) const {
		return ptr->getNewOrder(minfo, cur_price, new_price, dir, assets, currency);
	}
	///Calculates safe range
	/**
	 * @param minfo market info
	 * @param assets remaining assets
	 * @param currency remaining currency
	 * @return min-max values. To express "infinity", use std::numeric_limits::infinity()
	 */
	MinMax calcSafeRange(const IStockApi::MarketInfo &minfo, double assets, double currency) const {
		return ptr->calcSafeRange(minfo, assets, currency);
	}

	///Returns equilibrium
	double getEquilibrium() const {
		return ptr->getEquilibrium();
	}

	///Resets strategy - remove any remembered internal state
	void reset() {
		ptr = ptr->reset();
	}

	///dumps state of strategy in pretty format (best to display on admin page)
	json::Value dumpStatePretty(const IStockApi::MarketInfo &minfo) const  {
		return ptr->dumpStatePretty(minfo);
	}

	static Strategy create(std::string_view id, json::Value config);

	static void setConfig(const ondra_shared::IniConfig::Section &cfg);

	static void adjustOrder(double dir,double mult,bool enable_alerts, Strategy::OrderData &order);

protected:
	Ptr ptr;



};


#endif /* SRC_MAIN_STRATEGY_H_ */
