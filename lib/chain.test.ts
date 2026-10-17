import {describe,it,expect} from 'vitest'; import {robinhoodMainnet,robinhoodTestnet} from './chain';
describe('verified chain config',()=>{it('keeps official IDs distinct',()=>{expect(robinhoodMainnet.id).toBe(4663);expect(robinhoodTestnet.id).toBe(46630)});});
