/*
 * idailyperfmod.h
 *
 *  Created on: 24. 10. 2019
 *      Author: ondra
 */

#ifndef SRC_MAIN_IDAILYPERFMOD_H_
#define SRC_MAIN_IDAILYPERFMOD_H_
#include <string>

	struct PerformanceReport {
		std::size_t magic;
		std::size_t uid;
		std::string tradeId;
		std::string currency;
		std::string asset;
		std::string broker;
		///price where trade happened
		double price;
		///size of the trade
		double size;
		///account value change (assets are recalculated by current price)
		double change;
		///set true, if the record is from simulator
		bool simulator;
		uint64_t time;
	};


class IDailyPerfModule {
public:

	virtual void sendItem(const PerformanceReport &report) = 0;
	virtual json::Value getReport()  = 0;
	virtual ~IDailyPerfModule() {}
};



#endif /* SRC_MAIN_IDAILYPERFMOD_H_ */
