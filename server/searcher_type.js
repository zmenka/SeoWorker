/**
 * Created by zmenka on 02.01.15.
 */
function SearcherType() {

};
/**
 * Формируется массив объектов {page:<>, url:<>, sengine:<>} для поиска
 * @param condition
 * @returns {Array}
 */
SearcherType.prototype.getSearchUrls = function (condition) {

    if (!condition || !condition.sengine_name || !condition.condition_query
        || !condition.size_search || !condition.sengine_qmask || !condition.sengine_page_size) {
        throw 'Не хватает условий для формирования поиска!'
    }
    var page = 0;
    var size_page = condition.sengine_page_size;
    var search_links = [];
    var search_count = 0;
    switch (condition.sengine_name) {
        case 'Google':
            //https://www.google.ru/search?q=%D1%80%D0%B5%D0%BC%D0%BE%D0%BD%D1%82+iphone&newwindow=1&start=70
            var words = condition.condition_query
                .split(/\s/)
                .map(function (item) {
                    return encodeURIComponent(item)
                    }
                )
                .join('+')

            while (search_count < condition.size_search) {
                search_links.push({page: page, sengine: condition.sengine_name ,url: condition.sengine_qmask + 'q=' + words + (search_count > 0 ? '&start=' + search_count : "")})
                search_count += size_page;
                page++;
            }
            break;
        case 'Yandex':
            if (!condition.region) {
                throw 'Не определен регион!'
            }
            var words = condition.condition_query
                .split(/\s/)
                .map(function (item) {
                    return encodeURIComponent(item)
//                    return item
                }
            )
                .join('%20')
            //http://yandex.ru/yandsearch?lr=54&text=
            while (search_count < condition.size_search) {
                search_links.push({page: page, sengine: condition.sengine_name, url: condition.sengine_qmask +
//                    'lr%3D' + condition.region + '%26text%3D' + words + "%26p%3D" + page})
                    'lr=' + condition.region + '&text=' + words + "&p=" + page})
                search_count += size_page;
                page++;
            }
            break;
        default:
            throw 'Не найден требуемый поисковик!';
    }
    return search_links;
}

module.exports = SearcherType;