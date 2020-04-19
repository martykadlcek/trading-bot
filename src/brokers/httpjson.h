/*
 * httpjson.h
 *
 *  Created on: 15. 11. 2019
 *      Author: ondra
 */

#ifndef SRC_SIMPLEFX_HTTPJSON_H_
#define SRC_SIMPLEFX_HTTPJSON_H_

#include <string_view>
#include <imtjson/value.h>
#include <simpleServer/http_client.h>


class HTTPJson {
public:

	HTTPJson(simpleServer::HttpClient &&httpc, const std::string_view &baseUrl);
	void setToken(const std::string_view &token);


	json::Value GET(const std::string_view &path,
			json::Value &&headers = json::Value(),
			unsigned int expectedCode = 0);

	json::Value SEND(const std::string_view &path,
					const std::string_view &method,
					const json::Value &data,
					json::Value &&headers = json::Value(),
					unsigned int expectedCode = 0);

	json::Value POST(const std::string_view &path,
			const json::Value &data,
			json::Value &&headers = json::Value(),
			unsigned int expectedCode = 0);

	json::Value PUT(const std::string_view &path,
			const json::Value &data,
			json::Value &&headers = json::Value(),
			unsigned int expectedCode = 0);

	json::Value DELETE(const std::string_view &path,
			const json::Value &data,
			json::Value &&headers = json::Value(),
			unsigned int expectedCode = 0);


	class UnknownStatusException: public simpleServer::HTTPStatusException {
	public:
		UnknownStatusException(int code, const std::string &message, simpleServer::HttpResponse response)
			:simpleServer::HTTPStatusException(code,message),response(response) {}
		UnknownStatusException(int code, std::string &&message, simpleServer::HttpResponse response)
			:simpleServer::HTTPStatusException(code,std::move(message)),response(response) {}

		simpleServer::HttpResponse response;
	};


	void setBaseUrl(const std::string &url);

protected:
	simpleServer::HttpClient httpc;
	std::string baseUrl;

};





#endif /* SRC_SIMPLEFX_HTTPJSON_H_ */
