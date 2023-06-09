import { configureStore, createListenerMiddleware } from '@reduxjs/toolkit';
import { TypedUseSelectorHook, useDispatch, useSelector } from 'react-redux';
import { load, save } from 'redux-localstorage-simple';
import application from './application/reducer';
import createSale from './create-sale/reducer';
import { multicall } from './multicall/instance';
import payment from './payment/reducer';
import swaps from './swaps/reducer';
import swap from './swap/reducer';
import transactions from './transactions/reducer';
import ui from './ui/reducer';
import user from './user/reducer';
import lists from './lists/reducer';
import { updateVersion } from './transactions/actions';
const PERSISTED_KEYS: string[] = ['user', 'transactions', 'swaps'];

const listenerMiddleware = createListenerMiddleware();

const store = configureStore({
  reducer: {
    swaps,
    swap,
    createSale,
    ui,
    lists,
    application,
    transactions,
    user,
    multicall: multicall.reducer,
    payment,
  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ thunk: true, serializableCheck: false })
      .prepend(listenerMiddleware.middleware)
      .concat(save({ states: PERSISTED_KEYS, debounce: 1000 })),
  preloadedState: load({
    states: PERSISTED_KEYS,
    disableWarnings: process.env.NODE_ENV === 'production',
  }),
});

export type AppState = ReturnType<typeof store.getState>;

export const useAppDispatch = () => useDispatch();
export const useAppSelector: TypedUseSelectorHook<AppState> = useSelector;

store.dispatch(updateVersion());

export default store;
