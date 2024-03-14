import React from "react";

const Button = ({
  text,

  href,
  hover = false,
  bg,
  color,
  icon,
  classes,
}) => {
  return (
    <div>
      {hover ? (
        <a
          href={href ? href : `#`}
          className="relative inline-flex items-center justify-center px-6 py-3 text-lg font-bold tracking-tighter text-white bg-gray-800  group"
        >
          <span className="absolute inset-0 w-full h-full mt-1 ml-1 transition-all duration-300 ease-in-out bg-[#AE7AFF] opacity-55  group-hover:mt-0 group-hover:ml-0"></span>
          <span className="absolute inset-0 w-full h-full bg-[#AE7AFF]  "></span>
          <span className="absolute inset-0 w-full h-full transition-all duration-200 ease-in-out delay-100 bg-[#AE7AFF]opacity-0 group-hover:opacity-100 "></span>
          <span className="relative text-[#38333F] transition-colors duration-200 ease-in-out delay-100 group-hover:text-[#38333F]">
            {text ? text : "Button text"}
          </span>
        </a>
      ) : (
        <a
          href={href}
          className={`py-3 px-4 flex items-center  bg-${bg} text-${color} ${classes} `}
        >
          {" "}
          {icon}
          {text ? text : ""}{" "}
        </a>
      )}
    </div>
  );
};

export default Button;
