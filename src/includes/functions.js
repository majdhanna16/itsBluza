import { NavLink } from "react-router-dom";

export function makeMessage(title, msg, background_color, link_title, path) {

    let navlink;
    if(link_title && path)
    {
        const link_path = "/"+path;
        navlink = <NavLink className="Message_Link" to={link_path}>{link_title}</NavLink>
    }
    return (
        <div className="Message_display" style={{backgroundColor: background_color}}>
            <span className="Message_Title">{title}</span>
            <label className="Message_Content">{msg}</label>
            {navlink}
        </div>
    );
    //error color #e2401c

}


export function getFormattedPhoneNum( input ) {
    let output = "(";
    input.replace( /^\D*(\d{0,3})\D*(\d{0,3})\D*(\d{0,4})/, function( match, g1, g2, g3 )
        {
        if ( g1.length ) {
            output += g1;
            if ( g1.length === 3 ) {
                output += ")";
                if ( g2.length ) {
                    output += " " + g2; 
                    if ( g2.length === 3 ) {
                        output += "-";
                        if ( g3.length ) {
                            output += g3;
                        }
                    }
                }
            }
        }
        }       
    );        
    return output;
}  