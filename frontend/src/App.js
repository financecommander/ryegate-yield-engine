import React from 'react';
import { BrowserRouter, Route, Switch } from 'react-router-dom';

const App = () => {
    return (
        <BrowserRouter>
            <Switch>
                <Route path="/" component={Dashboard} />
                <Route path="/yield-positions" component={YieldPositions} />
                <Route path="/claim-rewards" component={ClaimRewards} />
                <Route path="/governance" component={Governance} />
            </Switch>
        </BrowserRouter>
    );
};

export default App;