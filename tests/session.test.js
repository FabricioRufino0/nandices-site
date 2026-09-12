import {test} from 'node:test';
import assert from 'node:assert/strict';
import {validLots,validPlanner,readSession} from '../src/lib/session.js';
test('sessão rejeita lotes incompatíveis e funciona sem storage',()=>{
 assert.equal(readSession('lots',validLots,'default'),'default');
 for(const value of [null,[],Array(11).fill({flavorId:'churros',cup:'Branquinho'}),[{flavorId:'fake',cup:'Branquinho'}],[{flavorId:'churros',cup:'fake'}],[{flavorId:'churros',cup:'Branquinho',cep:'70000000'}]])assert.ok(!validLots(value));
 assert.ok(validLots([{flavorId:'churros',cup:'Branquinho'}]));assert.ok(!validPlanner({eventId:'fake',guests:'40'}));
});
