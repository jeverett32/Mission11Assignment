using backend.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace backend.Controllers;

[ApiController]
[Route("api/[controller]")]
public class BooksController : ControllerBase
{
    private readonly BookstoreContext _context;

    public BooksController(BookstoreContext context)
    {
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<BookPageResponse>> GetBooks(
        [FromQuery] int page = 1,
        [FromQuery] int pageSize = 5,
        [FromQuery] string sortOrder = "asc",
        [FromQuery] string? category = null
    )
    {
        if (page < 1)
        {
            page = 1;
        }

        if (pageSize < 1)
        {
            pageSize = 5;
        }

        if (pageSize > 50)
        {
            pageSize = 50;
        }

        var normalizedCategory = string.IsNullOrWhiteSpace(category) ? null : category.Trim();

        var query = _context.Books.AsNoTracking();

        if (!string.IsNullOrEmpty(normalizedCategory))
        {
            query = query.Where(b => b.Category == normalizedCategory);
        }

        query = sortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase)
            ? query.OrderByDescending(b => b.Title)
            : query.OrderBy(b => b.Title);

        var totalBooks = await query.CountAsync();
        var books = await query.Skip((page - 1) * pageSize).Take(pageSize).ToListAsync();

        return Ok(
            new BookPageResponse
            {
                Books = books,
                TotalBooks = totalBooks,
                CurrentPage = page,
                PageSize = pageSize,
                TotalPages = (int)Math.Ceiling(totalBooks / (double)pageSize),
                SortOrder = sortOrder.Equals("desc", StringComparison.OrdinalIgnoreCase) ? "desc" : "asc",
                Category = normalizedCategory
            }
        );
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<Book>> GetBook(int id)
    {
        var book = await _context.Books.AsNoTracking().FirstOrDefaultAsync(b => b.BookId == id);
        if (book is null)
        {
            return NotFound();
        }

        return Ok(book);
    }

    [HttpPost]
    public async Task<ActionResult<Book>> CreateBook([FromBody] Book book)
    {
        if (book is null)
        {
            return BadRequest();
        }

        book.BookId = 0;

        _context.Books.Add(book);
        await _context.SaveChangesAsync();

        return CreatedAtAction(nameof(GetBook), new { id = book.BookId }, book);
    }

    [HttpPut("{id:int}")]
    public async Task<IActionResult> UpdateBook(int id, [FromBody] Book book)
    {
        if (book is null)
        {
            return BadRequest();
        }

        if (book.BookId != 0 && book.BookId != id)
        {
            return BadRequest("BookId in body must match route id.");
        }

        var existing = await _context.Books.FirstOrDefaultAsync(b => b.BookId == id);
        if (existing is null)
        {
            return NotFound();
        }

        existing.Title = book.Title;
        existing.Author = book.Author;
        existing.Publisher = book.Publisher;
        existing.Isbn = book.Isbn;
        existing.Classification = book.Classification;
        existing.Category = book.Category;
        existing.PageCount = book.PageCount;
        existing.Price = book.Price;

        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> DeleteBook(int id)
    {
        var book = await _context.Books.FirstOrDefaultAsync(b => b.BookId == id);
        if (book is null)
        {
            return NotFound();
        }

        _context.Books.Remove(book);
        await _context.SaveChangesAsync();

        return NoContent();
    }

    [HttpGet("categories")]
    public async Task<ActionResult<List<string>>> GetCategories()
    {
        var categories = await _context
            .Books.AsNoTracking()
            .Select(b => b.Category)
            .Distinct()
            .OrderBy(c => c)
            .ToListAsync();

        return Ok(categories);
    }
}

public class BookPageResponse
{
    public List<Book> Books { get; set; } = [];

    public int TotalBooks { get; set; }

    public int CurrentPage { get; set; }

    public int PageSize { get; set; }

    public int TotalPages { get; set; }

    public string SortOrder { get; set; } = "asc";

    public string? Category { get; set; }
}
