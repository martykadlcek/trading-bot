/*
 * proxy.h
 *
 *  Created on: 21. 5. 2019
 *      Author: ondra
 */

#ifndef SRC_COINMATE_PROXY_H_
#define SRC_COINMATE_PROXY_H_

#include <imtjson/value.h>
#include "../brokers/httpjson.h"

class Proxy {
public:

	Proxy();

	std::string apiPrivUrl;
	std::string apiPublicUrl;
	std::string privKey;
	std::string pubKey;

	HTTPJson httpc;

	std::uint64_t nonce;

	json::Value getTicker();


	json::Value public_request(std::string method, json::Value data);
	json::Value private_request(std::string method, json::Value data);

	bool hasKey() const;
	bool debug = false;

private:
	void buildParams(const json::Value& params, std::ostream& data);
};



#endif /* SRC_COINMATE_PROXY_H_ */
