import React from 'react';
import { ResponsiveContainer, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend } from 'recharts';

function MyBarChar(props) {
    const data = props.data;

    return (
        <>
            <div style={{ textAlign: 'center', marginBottom: '40px' }}>
                <h4 style={{ marginTop: '30px', color: 'rgb(129 120 120)' }}>Chart statistics</h4>
                <b />
            </div>
            <div style={{ marginBottom: '20px' }}>
                <ResponsiveContainer className="chart" height={450}>
                    <BarChart
                        width={600}
                        height={500}
                        data={data}
                        margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <XAxis dataKey="name" />
                        <YAxis />
                        <CartesianGrid strokeDasharray="3 3" />
                        <Tooltip />
                        <Legend />
                        <Bar dataKey="Money" fill="#82ca9d" />
                        <Bar dataKey="Orders" fill="#8884d8" />
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </>
    );
}

export default MyBarChar;
