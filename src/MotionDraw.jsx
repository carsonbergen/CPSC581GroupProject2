import React, { useEffect, useRef, useState } from 'react';

const MotionDraw = () => {

    const canvasRef = useRef(null);
    const ctxRef = useRef(null);
    const lastPosition = useRef({ x: 0, y: 0 });
    const [tracking, setTracking] = useState(false);

    useEffect(() => {
        const canvas = canvasRef.current;
        //setting canvas dimensions
        canvas.width = window.innerWidth;
        canvas.height = window.innerHeight;
        ctxRef.current = canvas.getContext('2d');
        ctxRef.current.lineJoin = 'round';
        ctxRef.current.lineCap = 'round';

        const handleMotion = (event) => {
            const x = event.acceleration.x || 0;
            const y = event.acceleration.y || 0;

            //calculate position while also centering/scaling
            const newX =(x * 10) + (canvas.width / 2);
            const newY =(y * -10) + (canvas.height / 2);

            //draw line only if tracking is enabled and movement is detected
            if (tracking && (lastPosition.current.x !== 0) && (lastPosition.current.y !== 0)) {
                draw(lastPosition.current.x, lastPosition.current.y, newX, newY);
            }

            lastPosition.current = { x: newX, y: newY };
        };

        if (tracking) {
            window.addEventListener('devicemotion', handleMotion);
        } else {
            window.removeEventListener('devicemotion', handleMotion);
        }

        return () => {
        window.removeEventListener('devicemotion', handleMotion);
        };
    }, [tracking]);

    const draw = (lastX, lastY, newX, newY) => {
    const ctx = ctxRef.current;

    ctx.strokeStyle = 'green';
    ctx.lineWidth = 5;

    ctx.beginPath();
    ctx.moveTo(lastX, lastY);
    ctx.lineTo(newX, newY);
    ctx.stroke();
    };

    const requestPermission = () => {
    if (typeof DeviceMotionEvent.requestPermission === 'function') {
        DeviceMotionEvent.requestPermission()
        .then((permissionState) => {
            if (permissionState === 'granted') {
            setTracking(true);
            } else {
            console.log('Permission denied for Device Motion');
            }
        })
        .catch((error) => {
            console.error('Error requesting permission:', error);
        });
    } else {
        setTracking(true);
    }
    };

    return (
        <div>
            <button onClick={requestPermission}>Enable Motion Tracking</button>
            <canvas ref={canvasRef} style={{ border: '1px solid black', marginTop: '10px' }} />
        </div>
    );
};

export default MotionDraw;
