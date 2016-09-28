import React from 'react';
import Field from '../components/Field';

class Fields extends React.Component {
    render() {
        let i = 0;
        let connectedFields = (this.props.cons.map(con => con[this.props.type].Field));
        return <div className={this.props.type}>
            {Object.keys(this.props.fields).map(field =>
                    <Field
                        key={i++}
                        field={field}
                        type={this.props.type}
                        node={this.props.node}
                        removeConnections={this.props.removeConnections}
                        connected={connectedFields.includes(field)}/>)}
        </div>
    }
}

export default Fields
