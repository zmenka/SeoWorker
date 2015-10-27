
describe('DB TEST', function(){
    describe('All', function(){

        it('sql test 4', function(){

            var PgParams = require(".././pg_params");
            return new PgParams().getParamtypes(1)
                .then(function(res){
                    console.log(res);
                });

        })
        //it('sql by list', function(){
        it('test UPDATE SEARCH RESULTS', function(){
            var PgExpressions = require("../../server/db/models/pg_expressions");
            var list = PgExpressions.UPDATE_POSITIONS(1508);
            return PgExpressions.execute_list(list)
                .then(function(res){
                    console.log(res);
                });

        })
        it('test UPDATE POSITIONS', function(){
            var PgExpressions = require("../../server/db/models/pg_expressions");
            var list = PgExpressions.UPDATE_SEARCH_RESULT();
            return PgExpressions.execute_list(list)
                .then(function(res){
                    console.log(res);
                });

        })

        it('test trans', function(){
            var PgExpressions = require("../../server/db/models/pg_expressions");
            return PgExpressions.TEST()
                .then(function(res){
                    console.log(res);
                });

        })
        it('test UPDATE CORRIDOR', function(){
            var corridor = {
                paramtype_name : "titleCS",
                m : 3,
                d : 2.5
            };
            var condition_id = 1111;
            var PgExpressions = require("../../server/db/models/pg_expressions");
            var list = PgExpressions.UPDATE_CORRIDOR(condition_id, corridor);
            return PgExpressions.execute_list(list)
                .then(function(res){
                    console.log(res);
                });

        })
        it('test UPDATE SEARCH RESULT', function(){
            var search_result = {
                pageNumber : 1,
                startLinksNumber : 0,
                links: [{url : 'test.ru/1', id: 1, params: [{name: "titleCS", val : 11}]},{ url : 'test.ru/2', id: 2, params: [{name: "titleCS", val : 13}]}]
            };
            var condition_id = 1111;
            var PgExpressions = require("../../server/db/models/pg_expressions");
            var list = PgExpressions.UPDATE_SEARCH_RESULT(condition_id, search_result);
            return PgExpressions.execute_list(list)
                .then(function(res){
                    console.log(res);
                });

        })
        it('test UPDATE CONDITION', function(){
            var search_result = {
                pageNumber : 1,
                startLinksNumber : 0,
                links: [{url : 'test.ru/1', id: 5, params: [{name: "titleCS", val : 999}]},{ url : 'test.ru/2', id: 7, params: [{name: "titleCS", val : 777}]}]
            };
            var corridor = {
                paramtype_name : "titleCS",
                m : 44,
                d : 21
            };
            var condition_id = 1111;
            var PgExpressions = require("../../server/db/models/pg_expressions");
            var list = PgExpressions.UPDATE_CONDITION(condition_id, [search_result],[corridor]);
            console.log(list)
            return PgExpressions.execute_list(list)
                .then(function(res){
                    console.log(res);
                });

        })
        it('test updater 0', function(){
            var updater = require("../../server/core/updater");
            return updater.update(664)
                .then(function(res){
                    console.log(res);
                });
        })
        it('test updater updateOneUrl', function(){
            var updater = require("../../server/core/updater");
            return updater.updateOneUrl(664, 22356)
                .then(function(res){
                    console.log(res);
                });
        })
        it('test updater updateOneUrlWithoutCondition', function(){
            var updater = require("../../server/core/updater");
            return updater.updateOneUrlWithoutCondition(664, 22356)
                .then(function(res){
                    console.log(res);
                });
        })
        //it('sql by list', function(){
        it('sql by list2', function(){

            var model = require("../../server/db/models/pg_params");
            return model.replace(1,1,1,1)
                .then(function(res){
                    console.log(res);
                });

        })
        it('getNextNotSearched', function(){
        //it.only('sql test 0', function(){

            var PgModel = require("../../server/db/models/pg_condurls");
            return PgModel.getNextNotSearched()
                .then(function(res){
                    console.log(res);
                });

        })
        it('test core', function(){
            var background = require("../../server/core/background");
            return background.run()
                .then(function(res){
                    console.log(res);
                });
        })
    })
})
