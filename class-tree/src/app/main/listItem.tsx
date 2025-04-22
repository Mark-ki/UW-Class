import React from 'react';

interface ListItemProps {
    addObject: (name:string , req?:string[]) => void;
    name: string;
    req?: string[];
}

const ListItem: React.FC<ListItemProps> = ({ addObject, name, req }) => {
    return (
        <li className="buttons p-2 border-b border-gray-300">
            {name} - This is a class.
            <button 
            onClick={() => addObject(name, req)} 
            className="p-1 ml-2 bg-red-500 text-white rounded-md">
                Add
            </button>
        </li>
    );
};

export default ListItem;