import React from 'react';
import Cookies from 'js-cookie';
import Alert from '../Alert.jsx';

class Shorten extends React.Component {
    constructor(props) {
        super(props);

        this.state = {
            response: false,
            sending: false,
        }

        // window.c = Cookies;
        console.log('session', Cookies.get('session'));
    }

    /**
     * 
     * @param {*} target
     */
    postData = (target) => {
        fetch('/api/shorten', {   // e.target.action
            body: JSON.stringify({ url: target.url.value }),
            credentials: 'include',
            headers: {
                'Content-Type': 'application/json',
            },
            method: target.method
        })
            .then((response) => response.json())
            .then((data) => {
                console.log('data', data);

                this.setState({
                    response: data,
                    sending: false
                });
            }).catch((err) => {
                console.log('err', err);

                this.setState({
                    sending: false
                });
            });
    }

    /**
     * 
     * @param {React.FormEventHandler} e 
     */
    onSubmit = (e) => {
        e.preventDefault();

        this.setState({ sending: true }, () => {
            this.postData(e.target);
        });
    }

    render() {
        const { response, sending } = this.state;

        return <>
            {
                response && !response.success &&
                <Alert
                    message={response.error}
                    type="warning" />
            }

            {(!response || !response.success) &&
                <form method="post" action="/shorten"
                    onSubmit={this.onSubmit}>
                    <div className="mb-3">
                        <input
                            aria-label="Long URL"
                            type="text"
                            className="form-control"
                            disabled={sending}
                            id="url"
                            name="url"
                            placeholder="https://"
                            tabIndex="3"
                        />
                    </div>
                    <div className="mb-3">
                        <button
                            type="submit"
                            className="btn btn-lg btn-primary btn-block"
                            disabled={sending}
                            tabIndex="4"
                        >Shorten</button>
                    </div>
                </form>
            }

            {response?.success &&
                <>
                    <p className="original">
                        <span className="url">{response.input_url}</span>
                        <span className="info">({response.input_url.length} characters)</span>
                    </p>

                    <p>has been shortened to</p>

                    <p className="result">
                        <a href={response.short_url}>{response.short_url}</a>
                        <span className="info">({response.short_url.length} characters)</span>
                    </p>

                    <p>
                        <a href={`${response.short_url}/info`}>Info</a>
                    </p>
                </>
            }
        </>;
    }
}

export default Shorten;