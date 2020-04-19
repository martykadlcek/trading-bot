/*
 * strategy_halfhalf.h
 *
 *  Created on: 18. 10. 2019
 *      Author: ondra
 */

#ifndef SRC_MAIN_STRATEGY_HALFHALF_H_
#define SRC_MAIN_STRATEGY_HALFHALF_H_
#include "istrategy.h"

class Strategy_HalfHalf: public IStrategy {
public:
	struct Config {
		double ea;
		double accum;
	};

	Strategy_HalfHalf(const Config &cfg, double p = 0, double a = 0);

	virtual bool isValid() const override;
	virtual PStrategy onIdle(const IStockApi::MarketInfo &minfo, const IStockApi::Ticker &curTicker, double assets, double currency) const override;
	virtual std::pair<OnTradeResult,PStrategy> onTrade(const IStockApi::MarketInfo &minfo, double tradePrice, double tradeSize, double assetsLeft, double currencyLeft) const override;;
	virtual json::Value exportState() const override;
	virtual PStrategy importState(json::Value src) const override;
	virtual OrderData getNewOrder(const IStockApi::MarketInfo &minfo,  double cur_price,double new_price, double dir, double assets, double currency) const override;
	virtual MinMax calcSafeRange(const IStockApi::MarketInfo &minfo, double assets, double currencies) const override;
	virtual double getEquilibrium() const override;
	virtual PStrategy reset() const override;
	virtual std::string_view getID() const override;
	virtual json::Value dumpStatePretty(const IStockApi::MarketInfo &minfo) const override;


	static std::string_view id;


protected:
	Config cfg;
	double p;
	double a;
};

#endif /* SRC_MAIN_STRATEGY_HALFHALF_H_ */
