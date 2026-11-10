import { canAdvance, weightedValue } from './rules';
describe('opportunity transitions',()=>{
 it('allows lead to qualified but never direct won',()=>{
  expect(canAdvance('lead','qualified')).toBe(true);
  expect(canAdvance('lead','won')).toBe(false);
 });
 it('protects terminal stages',()=>{
  expect(canAdvance('won','proposal')).toBe(false);
  expect(canAdvance('lost','lead')).toBe(false);
 });
 it('computes a currency-safe weighted forecast',()=>{
  expect(weightedValue(19999,35)).toBe(7000);
 });
});
