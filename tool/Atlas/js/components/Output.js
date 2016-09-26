import React from 'react';
import Field from './Field';

class Output extends React.Component {
    render() {
        let i = 0;
        let connectedFields = (this.props.cons.map(con => con.Output.Field));
        return <div className="Output">
            {Object.keys(this.props.output).map(field =>
                    <Field
                        key={i++}
                        field={field}
                        type={"Output"}
                        node={this.props.node}
                        removeConnections={this.props.removeConnections}
                        connected={connectedFields.includes(field)}/>)}
        </div>
    }
}

export default Output
