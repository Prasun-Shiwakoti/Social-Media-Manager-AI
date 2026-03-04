
import requests

response = requests.get(
    'https://www.google.com/inputtools/request?text=kasto&ime=transliteration_en_ne&num=5&cp=0&cs=0&ie=utf-8&oe=utf-8&app=jsapi&uv&cb=_callbacks_._0mkpp2bui',
)

print(response.text)