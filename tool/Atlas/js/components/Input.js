import React from 'react';
import Field from './Field';

class Input extends React.Component {
    render() {
        let i = 0;
        return <div className="Input"><br />
            {Object.keys(this.props.input).map(field =>
                    <Field
                        key={i++}
                        field={field}
                        type={"Input"}
                        node={this.props.node}/>)}
        </div>
    }
}

export default Input
