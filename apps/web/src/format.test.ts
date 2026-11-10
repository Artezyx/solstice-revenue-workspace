import { describe,it,expect } from 'vitest';
import { formatCents,nextStage } from './format';
describe('revenue helpers',()=>{
 it('formats integer minor units',()=>expect(formatCents(12345)).toBe('$123.45'));
 it('follows pipeline stage progression',()=>{expect(nextStage('lead')).toBe('qualified');expect(nextStage('won')).toBe(null);});
});
