#include "objectValue.h"

namespace json {




	std::size_t ObjectValue::size() const
	{
		return curSize;
	}

	const IValue * ObjectValue::itemAtIndex(std::size_t index) const
	{
		if (index < curSize) return (const IValue *)((*this)[index]);
		return getUndefined();
	}

	bool ObjectValue::enumItems(const IEnumFn &fn) const
	{
		for (auto &&x : *this) {
			if (!fn(x)) return false;
		}
		return true;
	}

	const IValue * ObjectValue::member(const StringView<char>& name) const {
		const IValue *r = findSorted(name);
		if (r == nullptr) return getUndefined();
		else return r;
	}
	const IValue *ObjectValue::findSorted(const StringView<char> &name) const
	{
		std::size_t l = 0;
		std::size_t r = size();
		while (l < r) {
			std::size_t m = (l + r) / 2;
			int c = name.compare(operator[](m)->getMemberName());
			if (c > 0) {
				l = m + 1;
			}
			else if (c < 0) {
				r = m;
			}
			else {
				return operator[](m);
			}
		}
		return nullptr;
	}


	void ObjectValue::sort() {
		std::stable_sort(begin(),end(),[](const PValue &left, const PValue &right) {
			return left->getMemberName().compare(right->getMemberName()) < 0;
		});
		StrViewA lastKey;
		std::size_t wrpos = 0;
		for (const PValue &v: *this) {
			StrViewA k = v->getMemberName();
			if (k == lastKey && wrpos) {
				wrpos--;
			}
			operator[](wrpos) = v;
			wrpos++;
			lastKey = k;
		}
		while (curSize > wrpos)
			pop_back();

	}

	RefCntPtr<ObjectValue> ObjectValue::create(std::size_t capacity) {
		AllocInfo nfo(capacity);
		return new(nfo) ObjectValue(nfo);
	}

	RefCntPtr<ObjectValue> ObjectValue::clone() const {
		RefCntPtr<ObjectValue> cp = create(size());
		*cp = *this;
		return cp;
	}

	ObjectValue& ObjectValue::operator =(const ObjectValue& other) {
		Container<PValue>::operator =(other);
		isDiff = other.isDiff;
		return *this;
	}

}

