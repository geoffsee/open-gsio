import React, { createContext, useContext, useState } from 'react';

type ComponentContextType = {
  enabledComponent: string;
  setEnabledComponent: (component: string) => void;
};

const ComponentContext = createContext<ComponentContextType>({
  enabledComponent: '',
  setEnabledComponent: () => {},
});

export const useComponent = () => useContext(ComponentContext);

export const ComponentProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [enabledComponent, setEnabledComponent] = useState<string>('');

  return (
    <ComponentContext.Provider value={{ enabledComponent, setEnabledComponent }}>
      {children}
    </ComponentContext.Provider>
  );
};

export default ComponentContext;
