const { useState, useEffect } = React;

const App = () => {
    const [count, setCount] = useState(0);
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        document.title = `Count: ${count}`;
    }, [count]);

    useEffect(() => {
        setInterval(() => {
            setCurrentTime(new Date());
        }, 1000);
    }, []);

    return (
        <>
            <p>Hello World s10cho</p>
            <p>Current Time: {currentTime.toLocaleTimeString()}</p>
            <button onClick={() => setCount(count + 1)}>Increment</button>
        </>
    );
}
