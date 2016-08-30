import React from 'react';
import Field from './Field';

class Output extends React.Component {
    render() {
        let i = 0;
        return <div className="Output"><br />
            {Object.keys(this.props.output).map(field =>
                    <Field
                        key={i++}
                        field={field}
                        type={"Output"}
                        node={this.props.node}/>)}
        </div>
    }
}

export default Output
