/**
 * Simple Package to Apply css classes via data-aiv custom Attribute when 
 * the Element enters the Viewport.
 * hardRefresh Function Resets usedElements and Searches for Elements
 * init can only be called once.
 */
export default {
    elements: [],
    usedElements: [],
    prevScrollY:  null,
    onScroll: async function(){
        if (this.prevScrollY === window.scrollY)
            return;

        this.elements.forEach(async (elem)  => {
            // Early Termination if not in Viewport or Element already Used;
            if(!this.inViewport(elem) || this.usedElements.includes(elem))
                return;
            this.usedElements.push(elem);
            const animClass = elem.getAttribute('data-aiv');
            // If has Delay Attribute, sets a Timeout to Apply the Selected Class
            if(elem.hasAttribute('data-aiv-delay')){
                setTimeout( async ()=>{
                    if(elem.className){
                        elem.className = elem.className + " " + animClass;
                    }
                    else { 
                        elem.className = animClass;
                    }
                }, elem.getAttribute('data-aiv-delay'))
        
            } else {
                if(elem.className) {
                    elem.className = elem.className + " " + animClass;
                }
                else {
                    elem.className = animClass;
                }
            }

        });  
    },

    // Determines if Element is in Viewport
    inViewport: async function(elem){
        let bcr = elem.getBoundingClientRect();
        return (
            bcr.top >= 0 &&
            bcr.left >= 0 &&
            bcr.right <= (window.innerWidth || document.documentElement.clientWidth),
            bcr.bottom >= (window.innerHeight || document.documentElement.clientHeight)
        );
    },

    // Gets all Elements with data-aiv custom attribute and Stores HTMLElements in an Arrayl
    refresh: async function() {
        this.elements = document.querySelectorAll('[data-aiv]');
    },
    /*
     * Clears Used Elements and Calls Refresh Function to add new Elements.
     */
    hardRefresh: async function() {
        this.usedElements = [];
        this.refresh();
    },

    /* 
     * Call after DOMContentLoaded Event is Fired to start up
     */
    onInit: async function (config = {}) {
        let error = null;
        try {
            await this.hardRefresh();
            window.addEventListener('scroll', async () => {
                this.onScroll();
            });
            // Dummy Scroll Event. If not Specified false, Dispatches Scroll Event.
            if(config?.dummyScroll ?? true)
                window.dispatchEvent(new Event('scroll'));
            delete this.init;
        } catch (e) {
            error = e;
        } finally {
            if(error)
                return e;
            else 
                return "Successfully Initialized AiV"; 
        }
    },
    init: async function (){
        delete this.init;
        return await this.onInit();
    },
    /*
     Terminates Aiv, lets you use the init function afterwards again to restart it
    */
    kill: async function(clearFlag = null, removeAnims = null){
        window.removeEventListener('scroll', async () => {
            this.onScroll();
        });
        if(removeAnims){
            this.usedElements.forEach((elem)=>{
                if(elem.hasAttribute('data-aiv')){
                    elem.className = elem.className.replace(elem.getAttribute('data-aiv'), '');
                }
            })
        }
        //if clearFlag is true, then it will clear the usedElements and elements Array.
        if (clearFlag){
            this.usedElements = [];
            this.elements = [];
        }
        
        //Allow you to reinitialize aiv after killing it.
        this.init = async function () {
            delete this.init;
            return await this.onInit();
        }
    }

}