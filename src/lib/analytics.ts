import ReactGA from 'react-ga4';

export const initGA = () => {
    // Only initialize in production mode to avoid skewing data with local dev
    if (import.meta.env.PROD) {
        ReactGA.initialize("G-XDMK184368");
    }
};

export const logPageView = () => {
    if (import.meta.env.PROD) {
        ReactGA.send({ hitType: "pageview", page: window.location.pathname });
    }
};

export const logEvent = (category: string, action: string, label?: string) => {
    if (import.meta.env.PROD) {
        ReactGA.event({
            category: category,
            action: action,
            label: label
        });
    }
};
