<div class="usa-grid-full">
  <div id="chemical-rules-loading-wrapper"
       class="chemical-rules-modal-wrapper">
    <h1>Loading search results for <span class="cr-chemical-name"></span>&hellip;</h1> <i class="fa fa-spinner" aria-hidden="true"></i>
  </div>
  <div id="chemical-rules-results-wrapper"
       class="chemical-rules-modal-wrapper">
    <ul class="cr-modal-actions">
      <li><a id="cr-save-favorite" class="save-favorite" href="javascript:void(0)" data-epaintnum="" data-favtype="Chemical" data-commonname="" data-sysname="" data-casnum="">Save to My Chemicals</a></li>
      <li><a id="cr-remove-favorite" class="remove-favorite remove-link" href="javascript:void(0)" data-epaintnum="" data-favtype="Chemical">Remove from Favorites</a></li>
      <li><a class="cr-future">Save as PDF</a></li>
      <li><a class="cr-future">Share This</a></li>
    </ul>
    <div class="cr-modal-toc" id="cr-modal-toc-icons">
      <li><a href="#cr-laws-regs" class="favorites-ignore">Laws &amp; Regulations</a></li>
      <li><a href="#cr-programs" class="favorites-ignore">EPA Programs</a></li>
      <li><a href="#cr-structure" class="favorites-ignore">Structure</a></li>
      <li><a href="#cr-properties" class="favorites-ignore">Chemical &amp; Physical Properties</a></li>
      <li><a href="#cr-synonyms" class="favorites-ignore">Synonyms</a></li>
      <li><a href="#cr-lists" class="favorites-ignore">Substance Lists</a></li>
    </div>
    
    <!-- @LAWS AND REGULATIONS -->
    <!-- @TODO Add favoriting ability to save favorite chemical here -->
    <h2 id="cr-laws-regs">Laws &amp; Regulations</h2>
    <p><span class="cr-laws-regs_count"></span> laws and regulations found for <span class="cr-chemical-name"></span>.  Relevant laws and regulations include:</p>

    <div id="cr-laws-regs-substances">
    </div><!-- @end #cr-laws-regs_substances -->
    
    <!-- @PROGRAMS -->
    <div id="cr-laws-regs_programs">
      <h2 id="cr-programs">EPA Programs</h2>
        <ul id="cr-programs-list">
        </ul>
    </div><!-- @end #cr-laws-regs_programs -->

    <!-- @STRUCTURE --> 
    <div id="cr-laws-regs_structure">   
      <h2 id="cr-structure">Structure</h2>
      <div class="cr-structure_container">
        <div class="cr-structure_image">
        </div>
        <div class="cr-structure_name">
          <p>C3H6O</p>
        </div>
      </div><!-- @end .cr-structure_container -->
    </div><!-- @end #cr-laws-regs_structure -->

    <!-- @CHEMICAL & PHYSICAL PROPERTIES -->    
    <div id="cr-laws-regs_properties">      
      <h2 id="cr-properties">Chemical &amp; Physical Properties</h2>
      <div class="cr-properties_container">
        <table id="cr-properties-table">
          <thead>
            <tr>
              <th scope="col" class="cr-property">Property</th>
              <th scope="col" class="cr-value">Value</th>
            </tr>
          </thead>
          <tbody>
          </tbody> 
        </table>
      </div><!-- @end .cr-properties_container -->    
    </div><!-- @end #cr-laws-regs_properties -->    

    <!-- @SYNONYMS -->    
    <div id="cr-laws-regs_synonyms">
      <h2 id="cr-synonyms">Synonyms</h2>
        <ul id="cr-synonyms-list">
        </ul>
    </div><!-- @end #cr-laws-regs_synonyms -->    
    
    <!-- @SUBSTANCE LISTS -->    
    <div id="cr-laws-regs_lists">    
      <h2 id="cr-lists">Substance Lists</h2>
        <ul id="cr-substances-list">
        </ul>    
    </div><!-- @end #cr-laws-regs_lists -->
    
  </div><!-- @end .chemical-rules-results-wrapper -->
</div><!-- @end usa-grid-full for CR -->
